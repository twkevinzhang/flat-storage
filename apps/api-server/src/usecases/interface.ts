import { Object } from '@/models';

export interface UseCase {
  /**
   * 以既有的路徑為ID（成本較低）
   */
  generateRecordsWithPathId(): Promise<void>;

  /**
   * 「重新攤平、製作新ID（成本較高）
   */
  generateRecordsWithNewId(): Promise<void>;

  listObjects(parent?: string): Promise<Object[]>;
  getObject(objectId: string): Promise<Object>;
  downloadAndGetObject(objectId: string): Promise<Object & { content: Buffer }>;
  createAndUploadObject(object: Object, content: Buffer): Promise<string>;
  deleteObject(objectId: string): Promise<void>;
  moveObject(objectId: string, newPath: string): Promise<void>;
}
