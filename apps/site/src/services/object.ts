import {
  ObjectEntity,
  SessionEntity,
  ObjectMimeType,
  Driver,
} from '@site/models';
import axios, { AxiosInstance } from 'axios';
import { GcsProxyClient } from './gcs';
import { proxyMetadataFile } from '@site/utilities/storage';
import { decodeProxyBuffer } from '@site/utilities';

export interface ObjectService {
  get({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<ObjectEntity>;

  getUploadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string>;

  getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string>;

  listObjects({
    session,
    path,
    entities,
  }: {
    session: SessionEntity;
    path?: string;
    entities?: ObjectEntity[];
  }): Promise<ObjectEntity[]>;
}

export class ObjectServiceImpl implements ObjectService {
  private axios: AxiosInstance;

  constructor() {
    const baseUrl = import.meta.env.VITE_GCS_PROXY;
    if (!baseUrl || (typeof baseUrl === 'string' && baseUrl.length === 0)) {
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
    throw new Error('Not implemented');
  }

  async getUploadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    throw new Error('Not implemented');
  }

  async getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    throw new Error('Not implemented');
  }

  async listObjects({
    session,
    path,
    entities: providedEntities,
  }: {
    session: SessionEntity;
    path?: string;
    entities?: ObjectEntity[];
  }): Promise<ObjectEntity[]> {
    if (session.driver === Driver.gcs) {
      let entities = providedEntities;

      if (!entities) {
        const [content] = await proxyMetadataFile(session).download();
        const contentStr = decodeProxyBuffer(content);
        entities = ObjectEntity.ArrayfromJson(contentStr);
      }

      if (!path) return entities;

      // remove mount
      let normalized = path || '/';
      if (!normalized.startsWith('/')) {
        normalized = '/' + normalized;
      }
      const parts = normalized.split('/');
      normalized = '/' + parts.slice(2).join('/');

      // Filter by path level
      const countSlashes = (s: string) => (s.match(/\//g) || []).length;

      if (normalized === '/') {
        return entities.filter((d: ObjectEntity) => countSlashes(d.path) === 1);
      }

      const result = entities.filter((item: ObjectEntity) => {
        if (!item.path.startsWith(normalized + '/')) return false;

        const itemSlashes = countSlashes(item.path);
        const pathSlashes = countSlashes(normalized);
        return itemSlashes === pathSlashes + 1;
      });

      return result;
    }
    return [];
  }
}

export class MockObjectService implements ObjectService {
  private readonly data: ObjectEntity[];

  constructor() {
    const objects = [];
    // Standard root items
    for (let i = 1; i <= 30; i++) {
      objects.push(
        ObjectEntity.new({
          path: `/root${i}`,
          md5Hash: `ID${2 * i}`,
          sizeBytes: 1234,
          mimeType: i % 2 !== 0 ? ObjectMimeType.folder : undefined,
        })
      );
    }
    // Specific sub-item
    objects.push(
      ObjectEntity.new({
        path: '/root1/sub1',
        md5Hash: 'ID4',
        sizeBytes: 1234,
      })
    );
    // Deep nesting
    let deepPath = '/root1';
    for (let i = 1; i <= 100; i++) {
      deepPath += '/yyyyyyyyyyyy';
      objects.push(
        ObjectEntity.new({
          path: deepPath,
          md5Hash: `ID${200 + i}`,
          sizeBytes: 1234,
          mimeType: ObjectMimeType.folder,
          createdAtISO: '2025-12-20T23:56:00.000Z',
          latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
        })
      );
    }
    this.data = objects;
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
    throw new Error('Not implemented');
  }

  getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    throw new Error('Not implemented');
  }

  listObjects({
    session,
    path,
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]> {
    const normalizedPath = path || '/';
    // Helper to count slashes
    const countSlashes = (s: string) => (s.match(/\//g) || []).length;

    if (normalizedPath === '/') {
      return Promise.resolve(
        this.data.filter((d: ObjectEntity) => countSlashes(d.path) === 1)
      );
    }

    const result = this.data.filter((item: ObjectEntity) => {
      const prefix = normalizedPath.endsWith('/')
        ? normalizedPath
        : normalizedPath + '/';
      if (!item.path.startsWith(prefix)) return false;

      const itemSlashes = countSlashes(item.path);
      const pathSlashes = countSlashes(normalizedPath);
      return itemSlashes === pathSlashes + 1;
    });
    return Promise.resolve(result);
  }
}
