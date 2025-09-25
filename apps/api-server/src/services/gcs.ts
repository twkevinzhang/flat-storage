import { Storage } from '@google-cloud/storage';
import { StorageService } from './interface';
import { Object } from '@api-server/models';

export class GCSService implements StorageService {
  private storage: Storage;
  private bucket: string;

  constructor(bucket: string) {
    this.storage = new Storage();
    this.bucket = bucket;
  }

  async objectExists(objectId: string): Promise<boolean> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(objectId);
    const [exists] = await file.exists();
    return exists;
  }

  async uploadObject(object: Object, content: Buffer): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(object.id);

    await file.save(content);

    return object.id;
  }

  async downloadObject(objectId: string): Promise<Buffer> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(objectId);
    const [content] = await file.download();

    return content;
  }

  async listObjects(parent?: string): Promise<Object[]> {
    const bucket = this.storage.bucket(this.bucket);
    const [files] = await bucket.getFiles({ prefix: parent });
    return files.map((file) => ({
      id: file.name,
      path: file.name, // FIXME
      size: Number(file.metadata.size),
      deletedAt: null,
    }));
  }
}
