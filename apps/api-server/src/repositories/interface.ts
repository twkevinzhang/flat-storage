import { Object } from '@/models';

export interface Repository {
  listObjects(parent?: string): Promise<Object[]>;
  getObject(objectId: string): Promise<Object>;
  createObject(object: Object): Promise<string>;
  batchCreateObjects(objects: Object[]): Promise<string[]>;
  editObject(objectId: string, object: Partial<Object>): Promise<void>;
  deleteObject(objectId: string): Promise<void>;
  clear(): Promise<void>;
}
