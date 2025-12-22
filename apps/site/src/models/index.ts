import { nanoid } from 'nanoid';

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
  sizeBytes = 'sizeBytes',
  createdAt = 'createdAt',
  latestUpdatedAt = 'latestUpdatedAt',
}

export const Columns = [
  {
    label: 'Name',
    key: ColumnKeys.name,
    icon: 'pi pi-file',
    type: 'text',
  },
  {
    label: 'Type',
    key: ColumnKeys.mimeType,
    icon: 'pi pi-tag',
    type: 'text',
  },
  {
    label: 'Size',
    key: ColumnKeys.sizeBytes,
    icon: 'pi pi-database',
    type: 'number',
  },
  {
    label: 'Created At',
    key: ColumnKeys.createdAt,
    icon: 'pi pi-calendar',
    type: 'date',
  },
  {
    label: 'Modified At',
    key: ColumnKeys.latestUpdatedAt,
    icon: 'pi pi-clock',
    type: 'date',
  },
];

export interface BucketEntity {
  name: string;
}

export class ObjectEntity {
  private constructor(
    public readonly path: EntityPath,
    public readonly mimeType?: ObjectMimeType,
    public readonly sizeBytes?: number,
    public readonly createdAtISO?: string,
    public readonly latestUpdatedAtISO?: string,
    public readonly md5Hash?: string,
    public readonly deletedAtISO?: string
  ) {}

  static new(params: {
    path: EntityPath;
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

  static fromJson(json: any, sessionId: string): ObjectEntity {
    return ObjectEntity.new({
      ...json,
      path: EntityPath.fromRoute({
        sessionId: sessionId,
        mount: json.path,
      }),
      mimeType: json.mimeType,
      sizeBytes: json.sizeBytes,
      createdAtISO: json.createdAtISO,
      latestUpdatedAtISO: json.latestUpdatedAtISO,
      md5Hash: json.md5Hash,
      deletedAtISO: json.deletedAtISO,
    });
  }

  // GCS File response doc: https://github.com/googleapis/nodejs-storage/blob/3dcda1b7153664197215c7316761e408ca870bc4/src/file.ts#L556
  static fromGCS(f: any, sessionId: string): ObjectEntity {
    const isFolder = f.metadata.name.endsWith('/');
    let normalizedPath = removeLeadingSlash(f.metadata.name);
    normalizedPath = removeTrailingSlash(normalizedPath);
    return ObjectEntity.new({
      ...f,
      ...f.metadata,
      path: EntityPath.fromRoute({
        sessionId,
        mount: normalizedPath,
      }),
      mimeType: isFolder ? ObjectMimeType.folder : f.metadata.contentType,
      sizeBytes: f.metadata.size,
      createdAtISO: f.metadata.timeFinalized,
      latestUpdatedAtISO: f.metadata.updated,
      md5Hash: f.metadata.md5Hash,
      deletedAtISO: f.metadata.deleted,
    });
  }

  toJson(): string {
    return JSON.stringify({
      path: this.path.toSegmentsString(),
      mimeType: this.mimeType,
      sizeBytes: this.sizeBytes,
      createdAtISO: this.createdAtISO,
      latestUpdatedAtISO: this.latestUpdatedAtISO,
      md5Hash: this.md5Hash,
      deletedAtISO: this.deletedAtISO,
    });
  }

  static ArrayfromJson(json: string, sessionId: string): ObjectEntity[] {
    return JSON.parse(json).map((item: any) => this.fromJson(item, sessionId));
  }

  get name(): string {
    return this.path.name;
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
    while (size >= 1024 && i < latestIndex(units)) {
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

export interface FilterRule {
  key: ColumnKeys;
  operator: string;
  value?: any;
  start?: Date | null;
  end?: Date | null;
}

export class ObjectsFilter {
  rules: FilterRule[];

  constructor(rules?: FilterRule[]) {
    this.rules = rules || [];
  }

  get isEmpty(): boolean {
    return isEmpty(this.rules);
  }

  get count(): number {
    return this.rules.length;
  }

  static empty(): ObjectsFilter {
    return new ObjectsFilter();
  }

  toQuery(): any {
    return {
      rules: this.rules.map((r) => ({
        ...r,
        start: r.start instanceof Date ? r.start.toISOString() : r.start,
        end: r.end instanceof Date ? r.end.toISOString() : r.end,
      })),
    };
  }

  toFlattenObj(): any {
    // This is mainly for PrimeVue Form if used,
    // but for the new dynamic UI, we might just use rules directly.
    return { rules: [...this.rules] };
  }

  static fromQuery(obj: any): ObjectsFilter {
    const filter = new ObjectsFilter();
    if (!obj || !Array.isArray(obj.rules)) return filter;

    filter.rules = obj.rules.map((r: any) => ({
      ...r,
      start: r.start ? new Date(r.start) : null,
      end: r.end ? new Date(r.end) : null,
    }));
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
    public readonly secretKey: string,
    public readonly projectId?: string
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
    projectId?: string;
  }): SessionEntity {
    return new SessionEntity(
      nanoid(6),
      params.name ?? 'Untitled',
      params.description,
      params.driver,
      params.mount,
      params.createdAtISO ?? new Date().toISOString(),
      params.latestConnectedISO,
      params.metadataPath ?? '/',
      params.accessKey,
      params.secretKey,
      params.projectId
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
    public readonly secretKey: string,
    public readonly projectId: string | undefined
  ) {}

  check(): void {
    if (!this.name) throw new Error('Name is required');
  }
}

export class EntityPath {
  public readonly sessionId: string;
  public readonly segments: string[] = [];

  private constructor(sessionId: string, segments: string[]) {
    this.sessionId = sessionId;
    this.segments = segments.filter(Boolean).filter((s) => !isEmpty(s.trim()));
  }

  static empty(): EntityPath {
    return new EntityPath('', []);
  }

  static root(sessionId: string): EntityPath {
    return new EntityPath(sessionId, []);
  }

  static fromRoute({
    sessionId,
    mount,
  }: {
    sessionId: string;
    mount: string;
  }): EntityPath {
    if (isEmpty(mount) || mount === '/') {
      return new EntityPath(sessionId, []);
    }
    if (mount.startsWith('/') || mount.endsWith('/'))
      throw new Error('Invalid path with slash');

    const segments = [];
    const cleaned = mount.replace(/^\/+|\/+$/g, '');
    if (cleaned) {
      segments.push(...cleaned.split('/').filter(Boolean));
    }
    return new EntityPath(sessionId, segments);
  }

  static fromString(s: string): EntityPath {
    if (s.startsWith('/') || s.endsWith('/'))
      throw new Error('Invalid path with slash');
    if (!s.startsWith('sessions')) throw new Error('Invalid path no session');
    if (!s.includes('/mount')) throw new Error('Invalid path no mount');
    const arr = s.split('/');
    return EntityPath.fromRoute({
      sessionId: arr[1],
      mount: arr.slice(3).join('/'),
    });
  }

  // toString(): sessions/[:sessionId]/mount/
  get isRootLevel(): boolean {
    return isEmpty(this.segments);
  }

  // toString(): sessions/[:sessionId]/mount/[...segments]
  get isSegmentLevel(): boolean {
    return !isEmpty(this.segments);
  }

  toString(): string {
    if (this.isRootLevel) {
      return joinPath('sessions', this.sessionId!, 'mount');
    }
    if (this.isSegmentLevel) {
      return joinPath('sessions', this.sessionId!, 'mount', ...this.segments);
    }
    throw new Error('Invalid path to string');
  }

  toSegmentsString(): string {
    if (this.isRootLevel) {
      return '/';
    }
    if (this.isSegmentLevel) {
      return this.segments.join('/');
    }
    throw new Error('Invalid path to string');
  }

  get name(): string {
    if (this.isRootLevel) {
      return '/';
    }
    if (this.isSegmentLevel) {
      return this.segments.at(-1)!;
    }
    throw new Error('Invalid path no name');
  }

  get parent(): EntityPath {
    if (this.isRootLevel) {
      throw new Error('Root level path has no parent');
    }
    const slice = this.segments.slice(0, -1);
    return new EntityPath(this.sessionId, slice);
  }

  renameTo(newName: string): EntityPath {
    if (this.isRootLevel) {
      throw new Error('Cannot rename root level path');
    }
    if (!newName) {
      throw new Error('New name cannot be empty');
    }
    if (newName.includes('/')) {
      throw new Error('New name cannot contain slashes');
    }
    return EntityPath.fromString(joinPath(this.parent.toString(), newName));
  }

  moveTo(newParent: EntityPath): EntityPath {
    if (this.isRootLevel) {
      throw new Error('Cannot move root level path');
    }
    return EntityPath.fromString(joinPath(newParent.toString(), this.name));
  }

  isDescendantOf(ancestor: EntityPath): boolean {
    if (this.toString() === ancestor.toString()) {
      return false;
    }
    return this.toString().startsWith(ancestor.toString() + '/');
  }

  isAncestorOf(descendant: EntityPath): boolean {
    return descendant.isDescendantOf(this);
  }

  get depth(): number {
    if (this.isRootLevel) {
      return 0;
    }
    if (this.isSegmentLevel) {
      return this.segments.length;
    }
    throw new Error('Invalid path no depth');
  }

  equals(other: EntityPath): boolean {
    return this.toString() === other.toString();
  }

  toRoute(): string {
    if (this.isRootLevel) {
      return joinPath('/sessions', this.sessionId!, 'mount');
    }
    if (this.isSegmentLevel) {
      return joinPath('/sessions', this.sessionId!, 'mount', ...this.segments);
    }
    throw new Error('Invalid path to route');
  }
}
