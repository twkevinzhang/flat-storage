import { BucketEntity, Driver, SessionEntity, SessionForm } from '@site/models';
import { GcsProxyClient } from './gcs';

export interface SessionService {
  listBuckets(args: {
    accessKey: string;
    secretKey: string;
    projectId?: string;
  }): Promise<BucketEntity[]>;
}

export class SessionServiceImpl implements SessionService {
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
    const client = new GcsProxyClient({
      accessKey: session.accessKey,
      secretKey: session.secretKey,
      projectId: session.projectId,
    });

    const bucket = client.bucket(session.mount);
    const metadataFile = bucket.file(session.metadataPath);

    const [exists] = await metadataFile.exists();

    if (!exists) {
      // 1.1 如果沒有，則枚舉所有檔案，並建立並寫入 metadata.tmp.jsonl 檔案，然後上傳到 session.metadataPath
      const [files] = await bucket.getFiles();
      // Enumerate all files and create metadata JSONL
      const content = files
        .map((f: any) => JSON.stringify(f.metadata || { name: f.name }))
        .join('\n');
      await metadataFile.save(content);
    } else {
      // 1.2 如果有，則檢查 bucket 中的數量與 metadata 是否一樣，有則當作正常，沒有則拋出錯誤。
      const [files] = await bucket.getFiles();
      const [content] = await metadataFile.download();
      
      // Handle content which might be a Buffer or string
      const contentStr = typeof content === 'string' ? content : content.toString();
      const lines = contentStr.trim().split('\n').filter((l: string) => l.length > 0);

      if (lines.length !== files.length) {
        throw new Error(
          `Metadata validation failed: bucket has ${files.length} files, but metadata record has ${lines.length} entries.`
        );
      }
    }
  }
}

