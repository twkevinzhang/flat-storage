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
      const bucketName = session.mount;
      const bucket = client.bucket(bucketName);

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
        md5Hash: 'ID2',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root1/sub1',
        md5Hash: 'ID4',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy',
        md5Hash: 'ID201',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID202',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID203',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID204',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID205',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID206',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID207',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID208',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID209',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID210',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID211',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID212',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID213',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID214',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID215',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID216',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID217',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID218',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID219',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID220',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID221',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID222',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID223',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID224',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID225',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID226',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID227',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID228',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID229',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID230',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID231',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID232',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID233',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID234',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID235',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID236',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID237',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID238',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID239',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID240',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID241',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID242',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID243',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID244',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID245',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID246',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID247',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID248',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID249',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID250',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID251',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID252',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID253',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID254',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID255',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID256',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID257',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID258',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID259',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID260',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID261',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID262',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID263',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID264',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID265',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID266',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID267',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID268',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID269',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID270',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID271',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID272',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID273',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID274',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID275',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID276',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID277',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID278',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID279',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID280',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID281',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID282',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID283',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID284',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID285',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID286',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID287',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID288',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID289',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID290',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID291',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID292',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID293',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID294',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID295',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID296',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID297',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID298',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID299',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID300',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID301',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID302',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID303',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID304',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID305',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID306',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID307',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID308',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID309',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID310',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID311',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID312',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID313',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID314',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID315',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID316',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID317',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID318',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID319',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID320',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID321',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID322',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID323',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID324',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID325',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID326',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID327',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID328',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID329',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID330',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID331',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID332',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID333',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID334',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID335',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID336',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID337',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID338',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID339',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID340',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID341',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID342',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID343',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID344',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID345',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID346',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID347',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID348',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID349',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID350',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID351',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID352',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID353',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID354',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID355',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID356',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID357',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID358',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID359',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID360',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID361',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID362',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID363',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID364',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root1/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy/yyyyyyyyyyyy',
        md5Hash: 'ID365',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
        createdAtISO: '2025-12-20T23:56:00.000Z',
        latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
      }),
      ObjectEntity.new({
        path: '/root2',
        md5Hash: 'ID6',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3',
        md5Hash: 'ID8',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder1',
        md5Hash: 'ID10',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder2',
        md5Hash: 'ID12',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder3',
        md5Hash: 'ID14',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub1',
        md5Hash: 'ID16',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub2',
        md5Hash: 'ID18',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub3',
        md5Hash: 'ID20',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub4',
        md5Hash: 'ID22',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub5',
        md5Hash: 'ID24',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub6',
        md5Hash: 'ID26',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub7',
        md5Hash: 'ID28',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub8',
        md5Hash: 'ID30',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub9',
        md5Hash: 'ID32',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub10',
        md5Hash: 'ID34',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub11',
        md5Hash: 'ID36',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub12',
        md5Hash: 'ID38',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub13',
        md5Hash: 'ID40',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub14',
        md5Hash: 'ID42',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub15',
        md5Hash: 'ID44',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub16',
        md5Hash: 'ID46',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub17',
        md5Hash: 'ID48',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub18',
        md5Hash: 'ID50',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub19',
        md5Hash: 'ID52',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub20',
        md5Hash: 'ID54',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub21',
        md5Hash: 'ID56',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub22',
        md5Hash: 'ID58',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub23',
        md5Hash: 'ID60',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub24',
        md5Hash: 'ID62',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub25',
        md5Hash: 'ID64',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub26',
        md5Hash: 'ID66',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub27',
        md5Hash: 'ID68',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub28',
        md5Hash: 'ID70',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub29',
        md5Hash: 'ID72',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub30',
        md5Hash: 'ID74',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root4root4roo t4root4root4r oot4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4',
        md5Hash: 'ID76',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root5',
        md5Hash: 'ID78',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root6',
        md5Hash: 'ID80',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root7',
        md5Hash: 'ID82',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root8',
        md5Hash: 'ID84',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root9',
        md5Hash: 'ID86',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root10',
        md5Hash: 'ID88',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root11',
        md5Hash: 'ID90',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root12',
        md5Hash: 'ID92',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root13',
        md5Hash: 'ID94',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root14',
        md5Hash: 'ID96',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root15',
        md5Hash: 'ID98',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root16',
        md5Hash: 'ID100',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root17',
        md5Hash: 'ID102',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root18',
        md5Hash: 'ID104',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root19',
        md5Hash: 'ID106',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root20',
        md5Hash: 'ID108',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root21',
        md5Hash: 'ID110',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root22',
        md5Hash: 'ID114',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root23',
        md5Hash: 'ID116',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root24',
        md5Hash: 'ID118',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root25',
        md5Hash: 'ID120',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root26',
        md5Hash: 'ID122',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root27',
        md5Hash: 'ID124',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root28',
        md5Hash: 'ID126',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root29',
        md5Hash: 'ID128',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root30',
        md5Hash: 'ID130',
        sizeBytes: 1234,
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
