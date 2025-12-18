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

export enum ColumnKeys {
  name = 'name',
  mimeType = 'mimeType',
  createdAt = 'createdAt',
  latestUpdatedAt = 'latestUpdatedAt',
}

export const MountColumns = [
  {
    label: 'Name',
    key: ColumnKeys.name,
    icon: '',
    type: 'text',
  },
  {
    label: 'Created At',
    key: ColumnKeys.createdAt,
    icon: '',
    type: 'date',
  },
];

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

class NameFilter {
  operator: string | null = null;
  condition: string | null = null;

  get isEmpty(): boolean {
    return this.operator === null && this.condition === null;
  }
}

class DateFilter {
  start: Date | null = null;
  end: Date | null = null;

  get isEmpty(): boolean {
    return this.start === null && this.end === null;
  }
}

export class ObjectsFilter {
  name: NameFilter;
  createdAt: DateFilter;

  constructor(initialState?: { name?: NameFilter; createdAt?: DateFilter }) {
    this.name = initialState?.name ||   new NameFilter();
    this.createdAt = initialState?.createdAt || new DateFilter();
  }

  get isEmpty(): boolean {
    return this.name.isEmpty && this.createdAt.isEmpty;
  }

  get count(): number {
    let c = 0;
    if (!this.name.isEmpty) c++;
    if (!this.createdAt.isEmpty) c++;
    return c;
  }

  static empty(): ObjectsFilter {
    return new ObjectsFilter();
  }

  toQuery(): any {
    return {
      name: {
        operator: this.name.operator,
        condition: this.name.condition,
      },
      createdAt: {
        start: this.createdAt.start
          ? this.createdAt.start.toISOString()
          : null,
        end: this.createdAt.end ? this.createdAt.end.toISOString() : null,
      },
    };
  }

  toFlattenObj(): any {
    return {
      'name.operator': this.name.operator,
      'name.condition': this.name.condition,
      'createdAt.start': this.createdAt.start
        ? this.createdAt.start.toISOString()
        : null,
      'createdAt.end': this.createdAt.end ? this.createdAt.end.toISOString() : null,
    };
  }

  static fromQuery(obj: any): ObjectsFilter {
    const filter = new ObjectsFilter();
    if (!obj) return filter;  

    filter.name.operator = obj.name?.operator || null;
    filter.name.condition = obj.name?.condition || null;
    if (obj.createdAt?.start) {
      filter.createdAt.start = new Date(obj.createdAt.start);
    }
    if (obj.createdAt?.end) {
      filter.createdAt.end = new Date(obj.createdAt.end);
    }
    return filter;
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
