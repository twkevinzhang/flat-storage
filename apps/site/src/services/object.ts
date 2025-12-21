import {
  ObjectEntity,
  SessionEntity,
  ObjectMimeType,
  Driver,
} from '@site/models';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { GcsProxyClient } from './gcs';
import { isEmpty } from 'lodash-es';

export class ObjectService {
  private axios: AxiosInstance;

  constructor() {
    const baseUrl = import.meta.env.VITE_GCS_PROXY;
    if (!baseUrl || isEmpty(baseUrl)) {
      throw new Error('VITE_GCS_PROXY is not defined');
    }
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 3000,
    });
  }

  async get({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<ObjectEntity> {
    if (session.driver === Driver.gcs) {
      const client = new GcsProxyClient({
        accessKey: session.accessKey,
        secretKey: session.secretKey,
      });
      const bucket = client.bucket(session.mount);
      const file = bucket.file(path === '/' ? '' : path.replace(/^\//, ''));
      const [metadata] = await file.getMetadata();

      return ObjectEntity.new({
        path: path,
        sizeBytes: parseInt(metadata.size),
        mimeType:
          metadata.contentType === ObjectMimeType.folder
            ? ObjectMimeType.folder
            : undefined,
        latestUpdatedAtISO: metadata.updated,
      });
    }
    throw new Error(`Driver ${session.driver} not supported`);
  }

  async getUploadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    return '';
  }

  async getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    return '';
  }

  async listObjects({
    session,
    path,
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]> {
    if (session.driver === Driver.gcs) {
      const client = new GcsProxyClient({
        accessKey: session.accessKey,
        secretKey: session.secretKey,
      });
      const bucket = client.bucket(session.mount);

      const normalizedPath = path === '/' ? '' : path?.replace(/^\//, '') || '';
      const prefix =
        normalizedPath === ''
          ? ''
          : normalizedPath.endsWith('/')
          ? normalizedPath
          : normalizedPath + '/';

      const [files, , apiResponse] = await bucket.getFiles({
        prefix,
        delimiter: '/',
        autoPaginate: false,
      });

      const objects: ObjectEntity[] = [];

      // Handle prefixes (folders)
      if (apiResponse && apiResponse.prefixes) {
        for (const p of apiResponse.prefixes) {
          objects.push(
            ObjectEntity.new({
              path: '/' + p,
              mimeType: ObjectMimeType.folder,
            })
          );
        }
      }

      // Handle files
      for (const f of files) {
        // Skip the prefix itself if it appears as a file
        if (f.name === prefix) continue;

        objects.push(
          ObjectEntity.new({
            path: '/' + f.name,
            sizeBytes: parseInt(f.metadata.size),
            mimeType:
              f.metadata.contentType === ObjectMimeType.folder
                ? ObjectMimeType.folder
                : undefined,
            latestUpdatedAtISO: f.metadata.updated,
          })
        );
      }

      return objects;
    }
    return [];
  }
}

export class MockObjectService {
  private readonly data: ObjectEntity[];
  constructor() {
    this.data = [
      ObjectEntity.new({
        path: '/root1',
        md5Hash: 'ID1',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root1/sub1',
        md5Hash: 'ID2',
        sizeBytes: 1234,
      }),
      ...range(1, 201).map((i) => {
        const segment = 'yyyyyyyyyyyy';
        const repeatedPath = Array(i).fill(segment).join('/');

        return ObjectEntity.new({
          path: `/root1/${repeatedPath}`,
          md5Hash: `ID${i + 3}`,
          sizeBytes: 1234,
          mimeType: ObjectMimeType.folder,
          createdAtISO: '2025-12-20T23:56:00.000Z',
          latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
        });
      }),
      ObjectEntity.new({
        path: '/root2',
        md5Hash: 'ID300',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3',
        md5Hash: 'ID301',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ...range(1, 4).map((i) => {
        return ObjectEntity.new({
          path: `/root3/folder${i}`,
          md5Hash: `ID${i + 302}`,
          sizeBytes: 1234,
          mimeType: ObjectMimeType.folder,
          createdAtISO: '2025-12-20T23:56:00.000Z',
          latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
        });
      }),

      ...range(1, 36).map((i) => {
        return ObjectEntity.new({
          path: `/root3/folder3/sub${i}`,
          md5Hash: `ID${i + 305}`,
          sizeBytes: 1234,
          mimeType: ObjectMimeType.folder,
          createdAtISO: '2025-12-20T23:56:00.000Z',
          latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
        });
      }),
      ObjectEntity.new({
        path: '/root4root4roo t4root4root4r oot4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4',
        md5Hash: 'ID342',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
      }),
      ...range(1, 30).map((i) => {
        return ObjectEntity.new({
          path: `/root${i + 4}`,
          md5Hash: `ID${i + 342}`,
          sizeBytes: 1234,
          mimeType: ObjectMimeType.folder,
          createdAtISO: '2025-12-20T23:56:00.000Z',
          latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
        });
      }),
    ];
  }

  get({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<ObjectEntity> {
    const object = this.data.find((obj) => obj.path === path);
    if (!object) throw new Error('Object not found');
    return Promise.resolve(object);
  }

  getUploadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    return Promise.resolve('');
  }

  getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    return Promise.resolve('');
  }

  listObjects({
    session,
    path,
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]> {
    path = path || '/';
    if (path === '/') {
      return Promise.resolve(this.data.filter((d) => count(d.path, '/') === 1));
    }
    const result = this.data.filter((item) => {
      const prefix = path!.endsWith('/') ? path : path + '/';
      if (!item.path.startsWith(prefix!)) return false;

      const itemSlashes = item.path.split('/').length - 1;
      const pathSlashes = path!.split('/').length - 1;
      return itemSlashes === pathSlashes + 1;
    });
    return Promise.resolve(result);
  }
}

export class ObjectAdapter {
  static normalizeMime(m: any): any {
    if (!m) return undefined;
    if (typeof m === 'string') return m as any;
    return String(m);
  }

  static fromBackend(item: any): ObjectEntity {
    const {
      path,
      mimeType,
      sizeBytes,
      createdAtISO,
      latestUpdatedAtISO,
      md5Hash,
      deletedAtISO,
    } = item;

    return ObjectEntity.fromAny({
      path,
      mimeType,
      sizeBytes,
      createdAtISO,
      latestUpdatedAtISO,
      md5Hash,
      deletedAtISO,
    });
  }

  static listFromBackend(items: any[]): ObjectEntity[] {
    if (!Array.isArray(items)) return [];
    return items.map((i) => this.fromBackend(i));
  }

  // Optionally convert frontend ObjectEntity back to backend payload
  static toBackend(entity: ObjectEntity): any {
    return {
      path: entity.path,
      mimeType: entity.mimeType,
      sizeBytes: (entity as any)._sizeBytes,
      createdAtISO: (entity as any)._createdAtISO,
      latestUpdatedAtISO: (entity as any)._latestUpdatedAtISO,
    };
  }
}
