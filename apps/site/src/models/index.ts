import { latestIndex } from '@site/utilities';
import qs from 'qs';

export class FileEntity {
  private _path: string;
  private _mimeType?: FileMimeType;
  private _sizeBytes?: number;
  private _createdAtISO?: string;
  private _latestUpdatedAtISO?: string;
  constructor({
    path,
    mimeType,
    sizeBytes,
    createdAtISO,
    latestUpdatedAtISO,
  }: {
    path: string;
    mimeType?: FileMimeType;
    sizeBytes?: number;
    createdAtISO?: string;
    latestUpdatedAtISO?: string;
  }) {
    this._path = path;
    this._mimeType = mimeType;
    this._sizeBytes = sizeBytes;
    this._createdAtISO = createdAtISO;
    this._latestUpdatedAtISO = latestUpdatedAtISO;
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
    return this._mimeType === 'folder';
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
}

export function mockFiles(): FileEntity[] {
  return [
    new FileEntity({
      path: 'root1',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root1/sub1',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root2',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder1',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder2',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub1',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub2',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub3',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub4',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub5',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub6',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub7',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub8',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub9',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub10',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub11',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub12',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub13',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub14',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub15',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub16',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub17',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub18',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub19',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub20',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub21',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub22',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub23',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub24',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub25',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub26',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub27',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub28',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub29',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root3/folder3/sub30',
      mimeType: 'txt',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root5',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root6',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root7',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root8',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root9',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root10',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root11',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root12',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root13',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root14',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root15',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root16',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root17',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root18',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root19',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root20',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root21',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root21',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root22',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root23',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root24',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root25',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root26',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root27',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root28',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root29',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
    new FileEntity({
      path: 'root30',
      mimeType: 'folder',
      sizeBytes: 1234,
      createdAtISO: '2024-01-01T12:00:00Z',
      latestUpdatedAtISO: '2024-01-02T12:00:00Z',
    }),
  ];
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

  get qs(): string {
    if (this.isEmpty) {
      return '';
    }

    const filterObject: any = {};

    if (this.name.operator && this.name.condition) {
      filterObject.name = {
        operator: this.name.operator,
        condition: this.name.condition,
      };
    }

    const dateFilter: any = {};
    if (this.createdAt.start) {
      dateFilter.start = this.createdAt.start.toISOString();
    }
    if (this.createdAt.end) {
      dateFilter.end = this.createdAt.end.toISOString();
    }
    if (Object.keys(dateFilter).length > 0) {
      filterObject.createdAt = dateFilter;
    }

    if (Object.keys(filterObject).length === 0) {
      return '';
    }

    return qs.stringify(filterObject, {
      skipNulls: true,
    });
  }

  clean() {
    this.name = { operator: null, condition: null };
    this.createdAt = { start: null, end: null };
  }

  static empty(): FilesFilter {
    return new FilesFilter();
  }

  static fromQs(queryString: string): FilesFilter {
    if (!queryString) {
      return FilesFilter.empty();
    }

    const parsedObject: any = qs.parse(queryString);

    const nameData = parsedObject.name || {};
    const nameFilter: NameFilter = {
      operator: nameData.operator || null,
      condition: nameData.condition || null,
    };

    const createdAtData = parsedObject.createdAt || {};

    const createdAtFilter: DateFilter = {
      start: createdAtData.start ? new Date(createdAtData.start) : null,
      end: createdAtData.end ? new Date(createdAtData.end) : null,
    };

    return new FilesFilter({
      name: nameFilter,
      createdAt: createdAtFilter,
    });
  }
}
