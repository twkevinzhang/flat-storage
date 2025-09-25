import * as fs from 'fs';
import * as csvlib from 'csv';
import { randomUUID, createHash } from 'crypto';
import { Repository } from './interface';
import { Object } from '@api-server/models';
import { StorageService } from '@api-server/services/interface';
import { ApiError } from '@google-cloud/storage';

export const RECORDS_PATH = 'records.csv';

export class CSVRepository implements Repository {
  private storage: StorageService;
  private tmpRecordsPath: string;

  constructor(storage: StorageService) {
    this.tmpRecordsPath = 'records.csv.tmp';
    this.storage = storage;
  }
  async clear(): Promise<void> {
    await this.prepareTmpRecords();
    await this.editRecords((record) => null); // If the callback returns null or undefined, the record is skipped.
    await this.saveRecords();
  }
  async listObjects(parent: string = '/'): Promise<Object[]> {
    await this.prepareTmpRecords();
    const list = await this.list();
    if (!parent) return list;
    return list.filter(
      (obj) => obj.deletedAt === null && obj.path.startsWith(parent)
    );
  }
  async getObject(objectId: string): Promise<Object> {
    await this.prepareTmpRecords();
    const objects = await this.list();
    const object = objects.find((obj) => obj.id === objectId);
    if (!object) throw new Error('Object not found');
    return object;
  }
  async createObject(object: Object): Promise<string> {
    await this.prepareTmpRecords();
    const id = object.id ?? randomUUID(); // 自動產生 UUID
    const record: Object = {
      id,
      path: object.path ?? id,
      md5Hash: object.md5Hash,
      sizeBytes: object.sizeBytes ?? 0,
      deletedAt: object.deletedAt ?? null,
    };
    await new Promise((resolve, reject) => {
      const stringifier = csvlib.stringify({
        header: false,
      });
      const writable = fs.createWriteStream(this.tmpRecordsPath, {
        flags: 'a',
      });

      stringifier
        .pipe(writable)
        .on('finish', () => resolve(id))
        .on('error', reject);

      stringifier.write(record);
      stringifier.end();
    });
    await this.saveRecords();
    return id;
  }
  async batchCreateObjects(objects: Object[]): Promise<string[]> {
    await this.prepareTmpRecords();
    const ids: string[] = [];
    for (const object of objects) {
      const id = object.id ?? randomUUID();
      const record: Object = {
        id,
        path: object.path ?? id,
        md5Hash: object.md5Hash,
        sizeBytes: object.sizeBytes ?? 0,
        deletedAt: object.deletedAt ?? null,
      };
      await new Promise((resolve, reject) => {
        const stringifier = csvlib.stringify({
          header: true,
        });
        const writable = fs.createWriteStream(this.tmpRecordsPath, {
          flags: 'a',
        });

        stringifier
          .pipe(writable)
          .on('finish', () => resolve(id))
          .on('error', reject);

        stringifier.write(record);
        stringifier.end();
      });
      ids.push(id);
    }
    await this.saveRecords();
    return ids;
  }
  async editObject(objectId: string, object: Partial<Object>): Promise<void> {
    await this.prepareTmpRecords();
    const objects = await this.list();
    const index = objects.findIndex((obj) => obj.id === objectId);
    if (index === -1) throw new Error('Object not found');

    const updatedObject = { ...objects[index], ...object };
    await this.editRecords((record) => {
      if (record.id === objectId) {
        return updatedObject;
      } else {
        return record;
      }
    });
    await this.saveRecords();
  }
  async deleteObject(objectId: string): Promise<void> {
    await this.prepareTmpRecords();
    const objects = await this.list();
    const index = objects.findIndex((obj) => obj.id === objectId);
    if (index === -1) return;

    await this.editRecords((record) => {
      if (record.id === objectId) {
        return {
          ...record,
          deletedAt: new Date(),
        };
      } else {
        return record;
      }
    });
    await this.saveRecords();
  }

  private async prepareTmpRecords(): Promise<void> {
    const exists = await this.fileExists(this.tmpRecordsPath);
    if (exists) return;

    try {
      await this.storage.downloadObject(RECORDS_PATH, this.tmpRecordsPath);
    } catch (error) {
      if (isApiErrorException(error) && error.code === 404) {
        this.createTmpRecords();
        return;
      }
      throw error;
    }
  }
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.promises.access(path, fs.constants.F_OK);
      return true;
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }
  private async createTmpRecords(): Promise<void> {
    await fs.promises.writeFile(this.tmpRecordsPath, '', 'utf8');
  }
  private async list(): Promise<Object[]> {
    return new Promise((resolve, reject) => {
      const results: Object[] = [];

      fs.createReadStream(this.tmpRecordsPath)
        .pipe(
          csvlib.parse({
            columns: true, // 把第一列當作欄位名稱
            skip_empty_lines: true,
          })
        )
        .pipe(
          csvlib.transform((record: any): Object => {
            return {
              id: record.id,
              path: record.path,
              md5Hash: record.md5Hash,
              sizeBytes: Number(record.size),
              deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
            };
          })
        )
        .on('data', (obj: Object) => {
          results.push(obj);
        })
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }
  private async editRecords(editFn: (record: any) => any): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(this.tmpRecordsPath)
        .pipe(
          csvlib.parse({
            columns: true,
            skip_empty_lines: true,
          })
        )
        .pipe(csvlib.transform(editFn))
        .pipe(
          csvlib.stringify({
            header: true,
          })
        )
        .pipe(fs.createWriteStream(this.tmpRecordsPath))
        .on('finish', resolve)
        .on('error', reject);
    });
  }
  private async saveRecords(): Promise<void> {
    const buffer = Buffer.from(fs.readFileSync(this.tmpRecordsPath));
    const md5Hash = getMd5Hash(buffer);
    await this.storage.uploadObject(
      {
        id: RECORDS_PATH,
        path: RECORDS_PATH,
        md5Hash: md5Hash,
        sizeBytes: buffer.length,
        deletedAt: null,
      },
      buffer
    );
  }
}

function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return typeof e === 'object' && e !== null && 'code' in e;
}

function isApiErrorException(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'code' in e;
}

function getMd5Hash(buffer: Buffer): string {
  return createHash('md5').update(buffer).digest('base64');
}
