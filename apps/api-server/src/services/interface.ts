import { Object } from '@api-server/models';

export interface StorageService {
  objectExists(objectId: string): Promise<boolean>;
  listObjects(parent?: string): Promise<Object[]>;
  downloadObject(objectId: string, destination: string): Promise<void>;
  uploadObject(object: Object, content: Buffer): Promise<string>;
  getDownloadLink(objectId: string): Promise<string>;
  getUploadLink(objectId: string): Promise<string>;
}
