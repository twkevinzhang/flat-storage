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
    if (content.length > 5 * 1024 * 1024) {
      // 大小不可超過 5MB
      throw new Error(
        `Object size exceeds the limit of 5MB: ${content.length} bytes`
      );
    }
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(object.id);

    await file.save(content);
    return object.id;
  }

  async downloadObject(objectId: string, destination: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(objectId);
    const metadata = await file.getMetadata();
    const size = Number(metadata[0].size);
    if (size > 5 * 1024 * 1024) {
      // 大小不可超過 5MB
      throw new Error(`Object size exceeds the limit of 5MB: ${size} bytes`);
    }
    await file.download({ destination });
  }

  async getDownloadLink(objectId: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(objectId);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return url;
  }

  async getUploadLink(objectId: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(objectId);
    const [url] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return url;
  }

  async listObjects(parent?: string): Promise<Object[]> {
    const bucket = this.storage.bucket(this.bucket);
    const [files] = await bucket.getFiles({ prefix: parent });
    return files.map((file) => ({
      id: file.name,
      path: file.name,
      md5Hash: file.metadata.md5Hash,
      sizeBytes: Number(file.metadata.size),
      deletedAt: null,
    }));
  }
}
