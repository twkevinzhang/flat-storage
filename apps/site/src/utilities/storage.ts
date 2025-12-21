import { Driver, SessionEntity } from '@site/models';
import { GcsProxyClient } from '@site/services/gcs';

export function proxyBucket(session: SessionEntity) {
  if (session.driver !== Driver.gcs) {
    throw new Error(`Driver ${session.driver} not supported`);
  }
  const client = new GcsProxyClient({
    accessKey: session.accessKey,
    secretKey: session.secretKey,
    projectId: session.projectId,
  });

  const bucket = client.bucket(removeLeadingSlash(session.mount));
  return bucket;
}

export function proxyMetadataFile(session: SessionEntity) {
  const bucket = proxyBucket(session);
  const metadataFile = bucket.file(removeLeadingSlash(session.metadataPath));
  return metadataFile;
}
