import axios, { AxiosInstance } from 'axios';

export class GCSService {
  private axios: AxiosInstance;

  private constructor(
    public readonly accessKey: string,
    public readonly secretKey: string,
    public readonly projectId: string
  ) {
    this.axios = axios.create({
      timeout: 3000,
      headers: {
        Authorization: accessKey,
      },
    });
  }

  static new({
    accessKey,
    secretKey,
    projectId,
  }: {
    accessKey: string;
    secretKey: string;
    projectId: string;
  }) {
    return new GCSService(accessKey, secretKey, projectId);
  }

  async listBuckets(): Promise<string[]> {
    return [];
  }
}

export interface GcsAuth {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  accessKey?: string;
  secretKey?: string;
}

export class GcsProxyClient {
  private baseUrl: string;

  constructor(private auth: GcsAuth) {
    this.baseUrl = (import.meta.env.VITE_GCS_PROXY).replace(/\/$/, '');
    if (!this.baseUrl || isEmpty(this.baseUrl)) {
      throw new Error('VITE_GCS_PROXY is not defined');
    }
  }

  bucket(name: string) {
    return new ProxyBucket(this.baseUrl, this.auth, name);
  }

  async getBuckets() {
    const res = await axios.post(`${this.baseUrl}/gcs/v1/execute`, {
      auth: this.auth,
      method: 'getBuckets',
      args: []
    });
    return res.data.data;
  }
}

export class ProxyBucket {
  constructor(
    private baseUrl: string,
    private auth: GcsAuth,
    private name: string
  ) {}

  file(path: string) {
    return new ProxyFile(this.baseUrl, this.auth, this.name, path);
  }

  async getFiles(options?: any) {
    return this.execute('getFiles', [options]);
  }

  async delete() {
    return this.execute('delete', []);
  }

  async exists() {
    return this.execute('exists', []);
  }

  async setMetadata(metadata: any) {
    return this.execute('setMetadata', [metadata]);
  }

  async get() {
    return this.execute('get', []);
  }

  private async execute(method: string, args: any[]) {
    const res = await axios.post(`${this.baseUrl}/gcs/v1/execute`, {
      auth: this.auth,
      bucket: this.name,
      method,
      args
    });
    return res.data.data;
  }
}

export class ProxyFile {
  constructor(
    private baseUrl: string,
    private auth: GcsAuth,
    private bucket: string,
    private path: string
  ) {}

  async getMetadata() {
    return this.execute('getMetadata', []);
  }

  async setMetadata(metadata: any) {
    return this.execute('setMetadata', [metadata]);
  }

  async delete() {
    return this.execute('delete', []);
  }

  async exists() {
    return this.execute('exists', []);
  }

  async move(destination: string | ProxyFile) {
    const destName = typeof destination === 'string' ? destination : destination.path;
    return this.execute('move', [destName]);
  }

  async get() {
    return this.execute('get', []);
  }

  private async execute(method: string, args: any[]) {
    const res = await axios.post(`${this.baseUrl}/gcs/v1/execute`, {
      auth: this.auth,
      bucket: this.bucket,
      file: this.path,
      method,
      args
    });
    return res.data.data;
  }
}

