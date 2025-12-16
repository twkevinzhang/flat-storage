import { latestIndex } from '@site/utilities';
import Column from 'primevue/column';
import { v4 as uuidv4 } from 'uuid';

export enum Driver {
  'gcs' = 'gcs',
  's3' = 's3',
  'azure' = 'azure',
  'localFilesystem' = 'local-filesystem',
}

export enum ObjectMimeType {
  zip = 'application/zip',
  txt = 'application/txt',
  folder = 'inode/directory',
}

export const MountColumns = [
    {
      label: 'Name',
      key: 'name',
      icon: '',
      type: 'text',
    },
    {
      label: 'Created At',
      key: 'createdAt',
      icon: '',
      type: 'date',
    },
  ]

export class ObjectEntity {
  private constructor(
    public readonly path: string,
    public readonly mimeType?: ObjectMimeType,
    public readonly sizeBytes?: number,
    public readonly createdAtISO?: string,
    public readonly latestUpdatedAtISO?: string,
    public readonly md5Hash?: string,
    public readonly deletedAtISO?: string
  ) {}

  static new(params: {
    path: string;
    mimeType?: ObjectMimeType;
    sizeBytes?: number;
    createdAtISO?: string;
    latestUpdatedAtISO?: string;
    md5Hash?: string;
    deletedAtISO?: string;
  }): ObjectEntity {
    return new ObjectEntity(
      params.path,
      params.mimeType,
      params.sizeBytes,
      params.createdAtISO,
      params.latestUpdatedAtISO,
      params.md5Hash,
      params.deletedAtISO
    );
  }

  static fromAny(json: any): ObjectEntity {
    return new ObjectEntity(
      json.path,
      json.mimeType,
      json.sizeBytes,
      json.createdAtISO,
      json.latestUpdatedAtISO,
      json.md5Hash,
      json.deletedAtISO
    );
  }

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

export class SessionEntity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly driver: Driver,
    public readonly mount: string,
    public readonly createdAtISO: string,
    public readonly latestConnectedISO: string | undefined,
    public readonly metadataPath: string,
    public readonly accessKey: string,
    public readonly secretKey: string
  ) {}

  static new(params: {
    name?: string;
    description?: string;
    driver: Driver;
    mount: string;
    createdAtISO?: string;
    latestConnectedISO?: string;
    metadataPath?: string;
    accessKey: string;
    secretKey: string;
  }): SessionEntity {
    return new SessionEntity(
      uuidv4(),
      params.name ?? 'Untitled',
      params.description,
      params.driver,
      params.mount,
      params.createdAtISO ?? new Date().toISOString(),
      params.latestConnectedISO,
      params.metadataPath ?? '/',
      params.accessKey,
      params.secretKey
    );
  }

  static fromAny(json: any): SessionEntity {
    return new SessionEntity(
      json.id,
      json.name,
      json.description,
      json.driver,
      json.mount,
      json.createdAtISO,
      json.latestConnectedISO,
      json.metadataPath,
      json.accessKey,
      json.secretKey
    );
  }

  get createdAt() {
    return new Date(this.createdAtISO);
  }
  get latestConnectedAt() {
    return this.latestConnectedISO
      ? new Date(this.latestConnectedISO)
      : undefined;
  }
}

export class SessionForm implements Partial<Omit<SessionEntity, 'id'>> {
  constructor(
    public readonly name: string | undefined,
    public readonly description: string | undefined,
    public readonly driver: Driver,
    public readonly mount: string,
    public readonly createdAtISO: string,
    public readonly latestConnectedISO: string | undefined,
    public readonly metadataPath: string,
    public readonly accessKey: string,
    public readonly secretKey: string
  ) {}

  check(): void {
    if (!this.name) throw new Error('Name is required');
  }
}
