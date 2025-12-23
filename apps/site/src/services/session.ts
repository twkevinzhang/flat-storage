import {
  BucketEntity,
  Driver,
  EntityPath,
  ObjectEntity,
  ObjectMimeType,
  SessionEntity,
  SessionForm,
} from '@site/models';
import { GcsProxyClient } from '@site/services/gcs';
import { proxyBucket, proxyMetadataFile } from '@site/utilities/storage';
import { decodeProxyBuffer } from '@site/utilities';

export interface SessionService {
  listBuckets(args: {
    accessKey: string;
    secretKey: string;
    projectId?: string;
  }): Promise<BucketEntity[]>;
  ensureMetadata(session: SessionEntity): Promise<void>;
  saveEntities(
    session: SessionEntity,
    newEntities: ObjectEntity[]
  ): Promise<void>;
  fetchEntities(session: SessionEntity): Promise<ObjectEntity[]>;
}

export class SessionServiceImpl implements SessionService {
  private syncingPromises = new Map<string, Promise<void>>();

  async listBuckets(args: {
    accessKey: string;
    secretKey: string;
    projectId?: string;
  }): Promise<BucketEntity[]> {
    const client = new GcsProxyClient({
      accessKey: args.accessKey,
      secretKey: args.secretKey,
      projectId: args.projectId,
    });

    // getBuckets returns [Bucket[], Metadata]
    const [buckets] = await client.getBuckets();

    return buckets.map((b: any) => ({
      name: b.name,
    }));
  }

  async ensureMetadata(session: SessionEntity): Promise<void> {
    if (this.syncingPromises.has(session.id)) {
      return this.syncingPromises.get(session.id);
    }

    const syncPromise = (async () => {
      try {
        const bucket = proxyBucket(session);
        const metadataFile = proxyMetadataFile(session);

        const [exists] = await metadataFile.exists();

        if (!exists) {
          // 1.1 如果沒有，則枚舉所有檔案，並建立並寫入 metadata.tmp.json 檔案，然後上傳到 session.metadataPath
          const [files] = await bucket.getFiles();
          const content = files.map((f: any) =>
            ObjectEntity.fromGCS(f, session.id)
          );
          await this.saveEntities(session, content);
        } else {
          // 1.2 如果有，則檢查 bucket 中的數量與 metadata 是否一樣，有則當作正常，沒有則拋出錯誤。
          // const [files] = await bucket.getFiles();
          // const [contentRaw] = await metadataFile.download();
          // const contentStr = decodeProxyBuffer(contentRaw);
          // const entities = JSON.parse(contentStr);
          // if (entities.length !== files.length) {
          //   throw new Error(
          //     `Metadata validation failed: bucket has ${files.length} files, but metadata record has ${entities.length} entries.`
          //   );
          // }
        }
      } finally {
        this.syncingPromises.delete(session.id);
      }
    })();

    this.syncingPromises.set(session.id, syncPromise);
    return syncPromise;
  }

  async saveEntities(
    session: SessionEntity,
    newEntities: ObjectEntity[]
  ): Promise<void> {
    const metadataFile = proxyMetadataFile(session);
    const content = newEntities.map((e) => e.toJson()).join(',\n');
    await metadataFile.save(`[\n${content}\n]`, {
      contentType: 'application/json',
      resumable: false,
    });
  }

  async fetchEntities(session: SessionEntity): Promise<ObjectEntity[]> {
    const [content] = await proxyMetadataFile(session).download();
    const contentStr = decodeProxyBuffer(content);
    const entities = ObjectEntity.ArrayfromJson(contentStr, session.id);
    return entities;
  }
}

export class MockSessionService implements SessionService {
  private readonly data: ObjectEntity[];

  constructor() {
    const objects = [];
    // Standard root items
    for (let i = 1; i <= 30; i++) {
      objects.push(
        ObjectEntity.new({
          path: EntityPath.fromString(`sessions/mock/mount/root${i}`),
          md5Hash: `ID${2 * i}`,
          sizeBytes: 1234,
          mimeType: i % 2 !== 0 ? ObjectMimeType.folder : undefined,
        })
      );
    }
    // Specific sub-item
    objects.push(
      ObjectEntity.new({
        path: EntityPath.fromString(`sessions/mock/mount/root1/sub1`),
        md5Hash: 'ID4',
        sizeBytes: 1234,
      })
    );
    // Deep nesting
    let deepPath = 'sessions/mock/mount/root1';
    for (let i = 1; i <= 100; i++) {
      deepPath += '/yyyyyyyyyyyy';
      objects.push(
        ObjectEntity.new({
          path: EntityPath.fromString(deepPath),
          md5Hash: `ID${200 + i}`,
          sizeBytes: 1234,
          mimeType: ObjectMimeType.folder,
          uploadedAtISO: '2025-12-20T23:56:00.000Z',
          latestUpdatedAtISO: '2025-12-20T23:56:00.000Z',
        })
      );
    }
    this.data = objects;
  }

  listBuckets(args: {
    accessKey: string;
    secretKey: string;
    projectId?: string;
  }): Promise<BucketEntity[]> {
    return Promise.resolve([]);
  }
  ensureMetadata(session: SessionEntity): Promise<void> {
    return Promise.resolve();
  }
  saveEntities(
    session: SessionEntity,
    newEntities: ObjectEntity[]
  ): Promise<void> {
    return Promise.resolve();
  }
  fetchEntities(session: SessionEntity): Promise<ObjectEntity[]> {
    throw new Error('Method not implemented.');
  }
}
