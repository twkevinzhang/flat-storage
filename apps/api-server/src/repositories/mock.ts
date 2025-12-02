import { Repository } from './interface';
import { Object } from '@api-server/models';

export const RECORDS_PATH = 'records.csv';

export class MockRepository implements Repository {
  constructor() {}
  async clear(): Promise<void> {
    // pass
  }
  async listObjects(parent: string = '/'): Promise<Object[]> {
    const list = await this.list();
    if (parent === '/') return list;
    return list.filter(
      (obj) => obj.deletedAt === null && obj.path.startsWith(parent)
    );
  }
  async getObject(objectId: string): Promise<Object> {
    await this.prepareTmpRecords();
    const objects = await this.list();
    const object = objects.find((obj) => obj.id === objectId);
    if (!object) throw new Error('Object not found');
    return object;
  }
  async createObject(object: Object): Promise<string> {
    return 'mock-object-id';
  }
  async batchCreateObjects(objects: Object[]): Promise<string[]> {
    return ['mock-object-id'];
  }
  async editObject(objectId: string, object: Partial<Object>): Promise<void> {
    return;
  }
  async deleteObject(objectId: string): Promise<void> {
    return;
  }

  private async prepareTmpRecords(): Promise<void> {}
  private async list(): Promise<Object[]> {
    return mockObjects();
  }
}

function mockObjects(): Object[] {
  return [
    {
      id: 'ID1',
      path: '/root1',
      md5Hash: 'ID2',
      sizeBytes: 1234,
      deletedAt: null,
      mimeType: 'inode/directory',
    },
    {
      id: 'ID3',
      path: '/root1/sub1',
      md5Hash: 'ID4',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID5',
      path: '/root2',
      md5Hash: 'ID6',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID7',
      path: '/root3',
      md5Hash: 'ID8',
      sizeBytes: 1234,
      deletedAt: null,
      mimeType: 'inode/directory',
    },
    {
      id: 'ID9',
      path: '/root3/folder1',
      md5Hash: 'ID10',
      sizeBytes: 1234,
      deletedAt: null,
      mimeType: 'inode/directory',
    },
    {
      id: 'ID11',
      path: '/root3/folder2',
      md5Hash: 'ID12',
      sizeBytes: 1234,
      deletedAt: null,
      mimeType: 'inode/directory',
    },
    {
      id: 'ID13',
      path: '/root3/folder3',
      md5Hash: 'ID14',
      sizeBytes: 1234,
      deletedAt: null,
      mimeType: 'inode/directory',
    },
    {
      id: 'ID15',
      path: '/root3/folder3/sub1',
      md5Hash: 'ID16',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID17',
      path: '/root3/folder3/sub2',
      md5Hash: 'ID18',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID19',
      path: '/root3/folder3/sub3',
      md5Hash: 'ID20',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID21',
      path: '/root3/folder3/sub4',
      md5Hash: 'ID22',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID23',
      path: '/root3/folder3/sub5',
      md5Hash: 'ID24',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID25',
      path: '/root3/folder3/sub6',
      md5Hash: 'ID26',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID27',
      path: '/root3/folder3/sub7',
      md5Hash: 'ID28',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID29',
      path: '/root3/folder3/sub8',
      md5Hash: 'ID30',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID31',
      path: '/root3/folder3/sub9',
      md5Hash: 'ID32',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID33',
      path: '/root3/folder3/sub10',
      md5Hash: 'ID34',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID35',
      path: '/root3/folder3/sub11',
      md5Hash: 'ID36',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID37',
      path: '/root3/folder3/sub12',
      md5Hash: 'ID38',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID39',
      path: '/root3/folder3/sub13',
      md5Hash: 'ID40',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID41',
      path: '/root3/folder3/sub14',
      md5Hash: 'ID42',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID43',
      path: '/root3/folder3/sub15',
      md5Hash: 'ID44',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID45',
      path: '/root3/folder3/sub16',
      md5Hash: 'ID46',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID47',
      path: '/root3/folder3/sub17',
      md5Hash: 'ID48',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID49',
      path: '/root3/folder3/sub18',
      md5Hash: 'ID50',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID51',
      path: '/root3/folder3/sub19',
      md5Hash: 'ID52',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID53',
      path: '/root3/folder3/sub20',
      md5Hash: 'ID54',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID55',
      path: '/root3/folder3/sub21',
      md5Hash: 'ID56',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID57',
      path: '/root3/folder3/sub22',
      md5Hash: 'ID58',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID59',
      path: '/root3/folder3/sub23',
      md5Hash: 'ID60',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID61',
      path: '/root3/folder3/sub24',
      md5Hash: 'ID62',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID63',
      path: '/root3/folder3/sub25',
      md5Hash: 'ID64',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID65',
      path: '/root3/folder3/sub26',
      md5Hash: 'ID66',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID67',
      path: '/root3/folder3/sub27',
      md5Hash: 'ID68',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID69',
      path: '/root3/folder3/sub28',
      md5Hash: 'ID70',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID71',
      path: '/root3/folder3/sub29',
      md5Hash: 'ID72',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID73',
      path: '/root3/folder3/sub30',
      md5Hash: 'ID74',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID75',
      path: '/root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4root4',
      md5Hash: 'ID76',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID77',
      path: '/root5',
      md5Hash: 'ID78',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID79',
      path: '/root6',
      md5Hash: 'ID80',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID81',
      path: '/root7',
      md5Hash: 'ID82',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID83',
      path: '/root8',
      md5Hash: 'ID84',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID85',
      path: '/root9',
      md5Hash: 'ID86',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID87',
      path: '/root10',
      md5Hash: 'ID88',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID89',
      path: '/root11',
      md5Hash: 'ID90',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID91',
      path: '/root12',
      md5Hash: 'ID92',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID93',
      path: '/root13',
      md5Hash: 'ID94',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID95',
      path: '/root14',
      md5Hash: 'ID96',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID97',
      path: '/root15',
      md5Hash: 'ID98',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID99',
      path: '/root16',
      md5Hash: 'ID100',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID101',
      path: '/root17',
      md5Hash: 'ID102',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID103',
      path: '/root18',
      md5Hash: 'ID104',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID105',
      path: '/root19',
      md5Hash: 'ID106',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID107',
      path: '/root20',
      md5Hash: 'ID108',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID109',
      path: '/root21',
      md5Hash: 'ID110',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID111',
      path: '/root21',
      md5Hash: 'ID112',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID113',
      path: '/root22',
      md5Hash: 'ID114',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID115',
      path: '/root23',
      md5Hash: 'ID116',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID117',
      path: '/root24',
      md5Hash: 'ID118',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID119',
      path: '/root25',
      md5Hash: 'ID120',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID121',
      path: '/root26',
      md5Hash: 'ID122',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID123',
      path: '/root27',
      md5Hash: 'ID124',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID125',
      path: '/root28',
      md5Hash: 'ID126',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID127',
      path: '/root29',
      md5Hash: 'ID128',
      sizeBytes: 1234,
      deletedAt: null,
    },
    {
      id: 'ID129',
      path: '/root30',
      md5Hash: 'ID130',
      sizeBytes: 1234,
      deletedAt: null,
    },
  ];
}
