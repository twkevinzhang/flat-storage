import {
  ObjectEntity,
  SessionEntity,
  ObjectMimeType,
  Driver,
} from '@site/models';
import axios, { AxiosInstance } from 'axios';
import { GcsProxyClient } from './gcs';

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
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]>;
   
}


export class ObjectServiceImpl implements ObjectService {
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
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]> {
    if (session.driver === Driver.gcs) {
      const contentStr = await this.downloadMetadataFile(session);
      
      // 2. Parse JSONL
      const allItems = contentStr
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => JSON.parse(line));

      // 3. Convert to entities (normalize path to include leading slash)
      const entities = allItems.map((item: any) => {
        const fullPath = item.name.startsWith('/') ? item.name : '/' + item.name;
        return ObjectEntity.new({
          path: fullPath,
          sizeBytes: parseInt(item.size || '0'),
          mimeType: item.contentType === ObjectMimeType.folder ? ObjectMimeType.folder : undefined,
          latestUpdatedAtISO: item.updated,
          md5Hash: item.md5Hash,
        });
      });

      // 4. Filter by path level (similar to MockObjectService)
      const normalizedPath = path || '/';
      const countSlashes = (s: string) => (s.match(/\//g) || []).length;

      if (normalizedPath === '/') {
        return entities.filter((d: ObjectEntity) => countSlashes(d.path) === 1);
      }

      const result = entities.filter((item: ObjectEntity) => {
        const prefix = normalizedPath.endsWith('/') ? normalizedPath : normalizedPath + '/';
        if (!item.path.startsWith(prefix)) return false;

        const itemSlashes = countSlashes(item.path);
        const pathSlashes = countSlashes(normalizedPath);
        return itemSlashes === pathSlashes + 1;
      });

      return result;
    }
    return [];
  }

  private async downloadMetadataFile(session: SessionEntity): Promise<string> {
    if (session.driver !== Driver.gcs) {
      throw new Error(`Driver ${session.driver} not supported`);
    }
    const client = new GcsProxyClient({
      accessKey: session.accessKey,
      secretKey: session.secretKey,
      projectId: session.projectId,
    });
    
    const bucket = client.bucket(this.removeLeadingSlash(session.mount));
    const metadataFile = bucket.file(this.removeLeadingSlash(session.metadataPath));
    const [content] = await metadataFile.download();
    return typeof content === 'string' ? content : (content as any).toString();
  }

  private removeLeadingSlash(path: string): string {
    return path.startsWith('/') ? path.slice(1) : path;
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
      return Promise.resolve(this.data.filter((d: ObjectEntity) => countSlashes(d.path) === 1));
    }

    const result = this.data.filter((item: ObjectEntity) => {
      const prefix = normalizedPath.endsWith('/') ? normalizedPath : normalizedPath + '/';
      if (!item.path.startsWith(prefix)) return false;

      const itemSlashes = countSlashes(item.path);
      const pathSlashes = countSlashes(normalizedPath);
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
