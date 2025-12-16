import { ObjectEntity, SessionEntity, ObjectMimeType } from '@site/models';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ObjectService {
  private axios: AxiosInstance;

  constructor() {
    const baseUrl = import.meta.env.VITE_API_BASE;
    if (!baseUrl || isEmpty(baseUrl)) {
      throw new Error('VITE_API_BASE is not defined');
    }
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 3000,
    });
  }

  get({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<ObjectEntity> {}

  getUploadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {}

  getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {}

  listObjects({
    session,
    path,
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]> {}
}

export class MockObjectService {
  private readonly data: ObjectEntity[];
  constructor() {
    this.data = [
      ObjectEntity.new({
        path: '/root1',
        md5Hash: 'ID2',
        sizeBytes: 1234,
        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root1/sub1',
        md5Hash: 'ID4',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root2',
        md5Hash: 'ID6',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3',
        md5Hash: 'ID8',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder1',
        md5Hash: 'ID10',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder2',
        md5Hash: 'ID12',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder3',
        md5Hash: 'ID14',
        sizeBytes: 1234,

        mimeType: ObjectMimeType.folder,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub1',
        md5Hash: 'ID16',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub2',
        md5Hash: 'ID18',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub3',
        md5Hash: 'ID20',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub4',
        md5Hash: 'ID22',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub5',
        md5Hash: 'ID24',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub6',
        md5Hash: 'ID26',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub7',
        md5Hash: 'ID28',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub8',
        md5Hash: 'ID30',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub9',
        md5Hash: 'ID32',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub10',
        md5Hash: 'ID34',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub11',
        md5Hash: 'ID36',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub12',
        md5Hash: 'ID38',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub13',
        md5Hash: 'ID40',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub14',
        md5Hash: 'ID42',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub15',
        md5Hash: 'ID44',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub16',
        md5Hash: 'ID46',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub17',
        md5Hash: 'ID48',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub18',
        md5Hash: 'ID50',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub19',
        md5Hash: 'ID52',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub20',
        md5Hash: 'ID54',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub21',
        md5Hash: 'ID56',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub22',
        md5Hash: 'ID58',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub23',
        md5Hash: 'ID60',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub24',
        md5Hash: 'ID62',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub25',
        md5Hash: 'ID64',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub26',
        md5Hash: 'ID66',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub27',
        md5Hash: 'ID68',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub28',
        md5Hash: 'ID70',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub29',
        md5Hash: 'ID72',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root3/folder3/sub30',
        md5Hash: 'ID74',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4',
        md5Hash: 'ID76',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root5',
        md5Hash: 'ID78',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root6',
        md5Hash: 'ID80',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root7',
        md5Hash: 'ID82',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root8',
        md5Hash: 'ID84',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root9',
        md5Hash: 'ID86',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root10',
        md5Hash: 'ID88',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root11',
        md5Hash: 'ID90',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root12',
        md5Hash: 'ID92',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root13',
        md5Hash: 'ID94',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root14',
        md5Hash: 'ID96',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root15',
        md5Hash: 'ID98',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root16',
        md5Hash: 'ID100',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root17',
        md5Hash: 'ID102',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root18',
        md5Hash: 'ID104',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root19',
        md5Hash: 'ID106',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root20',
        md5Hash: 'ID108',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root21',
        md5Hash: 'ID110',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root22',
        md5Hash: 'ID114',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root23',
        md5Hash: 'ID116',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root24',
        md5Hash: 'ID118',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root25',
        md5Hash: 'ID120',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root26',
        md5Hash: 'ID122',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root27',
        md5Hash: 'ID124',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root28',
        md5Hash: 'ID126',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root29',
        md5Hash: 'ID128',
        sizeBytes: 1234,
      }),
      ObjectEntity.new({
        path: '/root30',
        md5Hash: 'ID130',
        sizeBytes: 1234,
      }),
    ];
  }

  get({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<ObjectEntity> {
    const object = this.data.find((obj) => obj.path === path);
    if (!object) throw new Error('Object not found');
    return Promise.resolve(object);
  }

  getUploadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    return Promise.resolve('');
  }

  getDownloadSignedUrl({
    session,
    path,
  }: {
    session: SessionEntity;
    path: string;
  }): Promise<string> {
    return Promise.resolve('');
  }

  listObjects({
    session,
    path,
  }: {
    session: SessionEntity;
    path?: string;
  }): Promise<ObjectEntity[]> {
    console.log('listObjects', path);
    path = path || '/';
    if (path === '/') {
      return Promise.resolve(this.data.filter((d) => count(d.path, '/') === 1));
    }
    const result = this.data.filter((item) => {
      const prefix = path!.endsWith('/') ? path : path + '/';
      if (!item.path.startsWith(prefix!)) return false;

      const itemSlashes = item.path.split('/').length - 1;
      const pathSlashes = path!.split('/').length - 1;
      return itemSlashes === pathSlashes + 1;
    });

    return Promise.resolve(result);
  }
}

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

    return ObjectEntity.fromAny({
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
