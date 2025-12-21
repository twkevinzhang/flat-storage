import {
  BucketEntity,
  Driver,
  ObjectEntity,
  SessionEntity,
  SessionForm,
} from '@site/models';
import { GcsProxyClient } from './gcs';
import { proxyBucket, proxyMetadataFile } from '@site/utilities/storage';
import { decodeProxyBuffer } from '@site/utilities';

export interface SessionService {
  listBuckets(args: {
    accessKey: string;
    secretKey: string;
    projectId?: string;
  }): Promise<BucketEntity[]>;
  ensureMetadata(session: SessionEntity): Promise<void>;
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

        // delete me:
        const [files] = await bucket.getFiles();
        files.forEach((file) => {
          console.log('from GCS file', file);
        });

        const [exists] = await metadataFile.exists();

        if (!exists) {
          // 1.1 如果沒有，則枚舉所有檔案，並建立並寫入 metadata.tmp.json 檔案，然後上傳到 session.metadataPath
          const [files] = await bucket.getFiles();
          const content = files
            .map((f: any) => ObjectEntity.fromGCS(f).toJson())
            .join(',\n');
          await metadataFile.save(`[\n${content}\n]`, {
            contentType: 'application/json',
            resumable: false,
          });
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
}
