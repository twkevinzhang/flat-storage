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
}

