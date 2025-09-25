import { Repository } from '@api-server/repositories/interface';
import { UseCase } from './interface';
import { Object } from '@api-server/models';
import { StorageService } from '@api-server/services/interface';

export class UseCaseImpl implements UseCase {
  constructor(
    private repository: Repository,
    private storage: StorageService
  ) {}
  async generateRecordsWithPathId(): Promise<void> {
    const objects = await this.storage.listObjects();
    const newRecords = objects.map((obj) => ({
      id: obj.path,
      path: obj.path,
      size: obj.size,
      deletedAt: obj.deletedAt,
    }));
    await this.repository.clear();
    await this.repository.batchCreateObjects(newRecords);
  }
  async generateRecordsWithNewId(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async listObjects(parent?: string): Promise<Object[]> {
    return await this.repository.listObjects(parent);
  }
  async getObject(objectId: string): Promise<Object> {
    return await this.repository.getObject(objectId);
  }
  async downloadAndGetObject(
    objectId: string
  ): Promise<Object & { content: Buffer }> {
    const buffer = await this.storage.downloadObject(objectId);
    const object = await this.repository.getObject(objectId);
    return { ...object, content: buffer };
  }
  async createAndUploadObject(
    object: Object,
    content: Buffer
  ): Promise<string> {
    await this.repository.createObject(object);
    return this.storage.uploadObject(object, content);
  }
  async deleteObject(objectId: string): Promise<void> {
    return this.repository.deleteObject(objectId);
  }
  async moveObject(objectId: string, newPath: string): Promise<void> {
    return this.repository.editObject(objectId, { path: newPath });
  }
}
