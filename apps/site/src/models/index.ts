import { latestIndex } from '@site/utilities';
import qs from 'qs';
import { LocationQueryValue } from 'vue-router';

export class FileEntity {
  private _path: string;
  private _mimeType?: FileMimeType;
  private _sizeBytes?: number;
  private _createdAtISO?: string;
  private _latestUpdatedAtISO?: string;
  private _md5Hash?: string;
  private _deletedAtISO?: string;
  constructor({
    path,
    mimeType,
    sizeBytes,
    createdAtISO,
    latestUpdatedAtISO,
    md5Hash,
    deletedAtISO,
  }: {
    path: string;
    mimeType?: FileMimeType;
    sizeBytes?: number;
    createdAtISO?: string;
    latestUpdatedAtISO?: string;
    md5Hash?: string;
    deletedAtISO?: string;
  }) {
    this._path = path;
    this._mimeType = mimeType;
    this._sizeBytes = sizeBytes;
    this._createdAtISO = createdAtISO;
    this._latestUpdatedAtISO = latestUpdatedAtISO;
    this._md5Hash = md5Hash;
    this._deletedAtISO = deletedAtISO;
  }

  get name(): string {
    return this._path.split('/').pop() || '';
  }

  get path(): string {
    return this._path;
  }

  get mimeType(): FileMimeType | undefined {
    return this._mimeType;
  }

  get isFolder(): boolean {
    return this._mimeType === 'inode/directory';
  }

  get createdAt(): Date | undefined {
    return this._createdAtISO ? new Date(this._createdAtISO) : undefined;
  }

  get latestUpdatedAt(): Date | undefined {
    return this._latestUpdatedAtISO
      ? new Date(this._latestUpdatedAtISO)
      : undefined;
  }

  get sizeFormatted(): string {
    if (!this._sizeBytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this._sizeBytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < latestIndex(units)) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  get modifiedAtFormatted(): string {
    if (!this._latestUpdatedAtISO) return '-';
    const d = new Date(this._latestUpdatedAtISO);
    return d.toLocaleString();
  }

  get md5Hash(): string | undefined {
    return this._md5Hash;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAtISO ? new Date(this._deletedAtISO) : undefined;
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

export class FilesFilter {
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

  static empty(): FilesFilter {
    return new FilesFilter();
  }

  static fromObj(obj: any) {
    return new FilesFilter({
      name: obj.name,
      createdAt: obj.createdAt,
    });
  }
}
