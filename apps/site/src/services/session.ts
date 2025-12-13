import { Driver, SessionEntity, SessionForm } from '@site/models';

export interface SessionService {
  list(): Promise<SessionEntity[]>;
  get(id: string): Promise<SessionEntity>;
}

export class SessionServiceImpl implements SessionService {
  private static STORAGE_KEY = 'sessions';

  private static loadAll(): SessionEntity[] {
    const raw = localStorage.getItem(SessionServiceImpl.STORAGE_KEY);
    if (!raw) return [];

    try {
      const data = JSON.parse(raw) as any[];
      return data.map((d) =>
        SessionEntity.fromAny({
          id: d.id,
          name: d.name,
          driver: d.driver,
          mountPath: d.mountPath,
          createdAtISO: d.createdAtISO,
          latestConnectedISO: d.latestConnectedISO,
          metadataPath: d.metadataPath,
          accessKey: d.accessKey,
          secretKey: d.secretKey,
        })
      );
    } catch {
      return [];
    }
  }

  private static saveAll(list: SessionEntity[]): void {
    localStorage.setItem(SessionServiceImpl.STORAGE_KEY, JSON.stringify(list));
  }

  list(): Promise<SessionEntity[]> {
    return Promise.resolve(SessionServiceImpl.loadAll());
  }

  get(id: string): Promise<SessionEntity> {
    const r = SessionServiceImpl.loadAll().find((s) => s.id === id);
    if (!r) return Promise.reject(new Error('Session not found'));
    return Promise.resolve(r);
  }

  add(session: SessionEntity): Promise<void> {
    const list = SessionServiceImpl.loadAll();
    list.push(session);
    SessionServiceImpl.saveAll(list);
    return Promise.resolve();
  }

  update(id: string, patch: SessionForm): Promise<SessionEntity> {
    const list = SessionServiceImpl.loadAll();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return Promise.reject(new Error('Session not found'));

    const existing = list[index];

    const updated = SessionEntity.new({
      name: patch.name ?? existing.name,
      driver: patch.driver ?? existing.driver,
      mountPath: patch.mountPath ?? existing.mountPath,
      createdAtISO: existing.createdAtISO,
      latestConnectedISO: existing.latestConnectedISO,
      metadataPath: patch.metadataPath ?? existing.metadataPath,
      accessKey: patch.accessKey ?? existing.accessKey,
      secretKey: patch.secretKey ?? existing.secretKey,
    });

    list[index] = updated;
    SessionServiceImpl.saveAll(list);
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<void> {
    const list = SessionServiceImpl.loadAll().filter((s) => s.id !== id);
    SessionServiceImpl.saveAll(list);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    localStorage.removeItem(SessionServiceImpl.STORAGE_KEY);
    return Promise.resolve();
  }
}

export class MockSessionService implements SessionService {
  public readonly data: SessionEntity[];
  constructor() {
    this.data = [
      SessionEntity.fromAny({
        id: '1',
        name: 'AWS S3',
        description: 'Connect to an Amazon S3 bucket.',
        driver: Driver.s3,
        mountPath: 'mountPath',
        createdAtISO: '2025-12-12T13:03:52.594Z',
        latestConnectedISO: '2025-12-12T13:03:52.594Z',
        accessKey: 'accessKeyaccessKey',
        secretKey: 'secretKeysecretKey',
      }),
      SessionEntity.fromAny({
        id: '2',
        name: 'Google Cloud Storage',
        description: 'Access files in a GCS bucket.',
        driver: Driver.gcs,
        mountPath: 'mountPath',
        createdAtISO: '2025-12-12T13:03:52.594Z',
        latestConnectedISO: '2025-12-12T13:03:52.594Z',
        accessKey: 'accessKeyaccessKey',
        secretKey: 'secretKeysecretKey',
      }),
    ];
  }
  list(): Promise<SessionEntity[]> {
    return Promise.resolve(this.data);
  }

  get(id: string): Promise<SessionEntity> {
    const r = this.data.find((s) => s.id === id);
    if (!r) return Promise.reject(new Error('Session not found'));
    return Promise.resolve(r);
  }
}

export class SessionAdapter {
  static normalizeMime(m: any): any {
    if (!m) return undefined;
    if (typeof m === 'string') return m as any;
    return String(m);
  }

  static fromBackend(item: any): SessionEntity {
    const {
      id,
      name,
      description,
      driver,
      mountPath,
      createdAtISO,
      latestConnectedISO,
      accessKey,
      secretKey,
    } = item;

    return SessionEntity.fromAny({
      id,
      name,
      description,
      driver,
      mountPath,
      createdAtISO,
      latestConnectedISO,
      accessKey,
      secretKey,
    });
  }

  static listFromBackend(items: any[]): SessionEntity[] {
    if (!Array.isArray(items)) return [];
    return items.map((i) => this.fromBackend(i));
  }

  // Optionally convert frontend SessionEntity back to backend payload
  static toBackend(entity: SessionEntity): any {}
}
