import { Object } from '@/models';

export interface StorageService {
  objectExists(objectId: string): Promise<boolean>;
  listObjects(parent?: string): Promise<Object[]>;
  downloadObject(objectId: string): Promise<Buffer>;
  uploadObject(object: Object, content: Buffer): Promise<string>;
}
