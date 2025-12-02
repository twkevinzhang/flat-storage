import { latestIndex } from '@site/utilities';
import { v4 as uuidv4 } from 'uuid';

export enum Driver {
  'gcs' = 'gcs',
  's3' = 's3',
  'localFilesystem' = 'local-filesystem',
}

export class ObjectEntity {
  constructor(
    public readonly path: string,
    public readonly mimeType?: ObjectMimeType,
    public readonly sizeBytes?: number,
    public readonly createdAtISO?: string,
    public readonly latestUpdatedAtISO?: string,
    public readonly md5Hash?: string,
    public readonly deletedAtISO?: string
  ) {}

  get name(): string {
    return this.path.split('/').pop() || '';
  }

  get isFolder(): boolean {
    return this.mimeType === ObjectMimeType.folder;
  }

  get createdAt(): Date | undefined {
    return this.createdAtISO ? new Date(this.createdAtISO) : undefined;
  }

  get latestUpdatedAt(): Date | undefined {
    return this.latestUpdatedAtISO
      ? new Date(this.latestUpdatedAtISO)
      : undefined;
  }

  get sizeFormatted(): string {
    if (!this.sizeBytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.sizeBytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  }

  get modifiedAtFormatted(): string {
    if (!this.latestUpdatedAtISO) return '-';
    return new Date(this.latestUpdatedAtISO).toLocaleString();
  }

  get deletedAt(): Date | undefined {
    return this.deletedAtISO ? new Date(this.deletedAtISO) : undefined;
  }
}

interface NameFilter {
  operator: string | null;
  condition: string | null;
}

interface DateFilter {
  start: Date | null;
  end: Date | null;
}

export class ObjectsFilter {
  name: NameFilter;
  createdAt: DateFilter;

  constructor(initialState?: { name?: NameFilter; createdAt?: DateFilter }) {
    this.name = initialState?.name || { operator: null, condition: null };
    this.createdAt = initialState?.createdAt || { start: null, end: null };
  }

  get isEmpty(): boolean {
    return (
      this.name.operator === null &&
      this.name.condition === null &&
      this.createdAt.start === null &&
      this.createdAt.end === null
    );
  }

  static empty(): ObjectsFilter {
    return new ObjectsFilter();
  }

  static fromObj(obj: any) {
    return new ObjectsFilter({
      name: obj.name,
      createdAt: obj.createdAt,
    });
  }
}
