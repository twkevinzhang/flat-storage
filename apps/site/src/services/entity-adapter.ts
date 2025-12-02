import { ObjectEntity } from '@site/models';

/**
 * ObjectAdapter: transforms backend payload <-> frontend model (ObjectEntity)
 * All mapping rules live here so rest of app uses stable ObjectEntity objects.
 */
export class ObjectAdapter {
  static normalizeMime(m: any): any {
    if (!m) return undefined;
    if (typeof m === 'string') return m as any;
    return String(m);
  }

  static fromBackend(item: any): ObjectEntity {
    const {
      path,
      mimeType,
      sizeBytes,
      createdAtISO,
      latestUpdatedAtISO,
      md5Hash,
      deletedAtISO,
    } = item;

    return ObjectEntity.new({
      path,
      mimeType,
      sizeBytes,
      createdAtISO,
      latestUpdatedAtISO,
      md5Hash,
      deletedAtISO,
    });
  }

  static listFromBackend(items: any[]): ObjectEntity[] {
    if (!Array.isArray(items)) return [];
    return items.map((i) => this.fromBackend(i));
  }

  // Optionally convert frontend ObjectEntity back to backend payload
  static toBackend(entity: ObjectEntity): any {
    return {
      path: entity.path,
      mimeType: entity.mimeType,
      sizeBytes: (entity as any)._sizeBytes,
      createdAtISO: (entity as any)._createdAtISO,
      latestUpdatedAtISO: (entity as any)._latestUpdatedAtISO,
    };
  }
}
