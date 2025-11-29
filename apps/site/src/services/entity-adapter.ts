import { FileEntity } from '@site/models';

/**
 * FileAdapter: transforms backend payload <-> frontend model (FileEntity)
 * All mapping rules live here so rest of app uses stable FileEntity objects.
 */
export class FileAdapter {
  static normalizeMime(m: any): any {
    if (!m) return undefined;
    if (typeof m === 'string') return m as any;
    return String(m);
  }

  static fromBackend(item: any): FileEntity {
    const {
      path,
      mimeType,
      sizeBytes,
      createdAtISO,
      latestUpdatedAtISO,
      md5Hash,
      deletedAtISO,
    } = item;

    return new FileEntity({
      path,
      mimeType,
      sizeBytes,
      createdAtISO,
      latestUpdatedAtISO,
      md5Hash,
      deletedAtISO,
    });
  }

  static listFromBackend(items: any[]): FileEntity[] {
    if (!Array.isArray(items)) return [];
    return items.map((i) => this.fromBackend(i));
  }

  // Optionally convert frontend FileEntity back to backend payload
  static toBackend(entity: FileEntity): any {
    return {
      path: entity.path,
      mimeType: entity.mimeType,
      sizeBytes: (entity as any)._sizeBytes,
      createdAtISO: (entity as any)._createdAtISO,
      latestUpdatedAtISO: (entity as any)._latestUpdatedAtISO,
    };
  }
}
