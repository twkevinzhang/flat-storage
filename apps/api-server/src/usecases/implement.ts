import { Repository } from '@api-server/repositories/interface';
import { UseCase } from './interface';
import { Object } from '@api-server/models';

export class UseCaseImpl implements UseCase {
  constructor(private repository: Repository) {}
  async generateRecordsWithPathId(): Promise<void> {
    const objects = await this.repository.listObjects();
    const newRecords = objects.map((obj) => ({
      id: obj.path,
      path: obj.path,
      sizeBytes: obj.sizeBytes,
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
  async getObjectAndGetDownloadLink(
    objectId: string
  ): Promise<Object & { downloadLink: string }> {
    throw new Error('Method not implemented.');
  }
  async createObjectAndGetUploadLink(
    object: Object
  ): Promise<{ uploadLink: string }> {
    throw new Error('Method not implemented.');
  }
  async deleteObject(objectId: string): Promise<void> {
    return this.repository.deleteObject(objectId);
  }
  async moveObject(objectId: string, newPath: string): Promise<void> {
    return this.repository.editObject(objectId, { path: newPath });
  }
}
