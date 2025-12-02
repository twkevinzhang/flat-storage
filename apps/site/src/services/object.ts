import { Session } from '@site/models';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ObjectService {
  private axios: AxiosInstance;

  constructor(baseUrl?: string) {
    this.axios = axios.create({
      baseURL: baseUrl ?? (import.meta.env.VITE_API_BASE as string) ?? '',
      timeout: 3000,
    });
  }

  get({ session, path }: { session: Session; path: string }) {}

  getUploadSignedUrl({
    session,
    path,
  }: {
    session: Session;
    path: string;
  }): Promise<string> {}

  getDownloadSignedUrl({
    session,
    path,
  }: {
    session: Session;
    path: string;
  }): Promise<string> {}

  listBuckets({ session, parent }: { session: Session; parent?: string }) {
    return this.get({
      session,
      path: `/driver/${session.driver}/buckets`,
    });
  }

  listObjects({
    session,
    bucket,
    parent,
  }: {
    session: Session;
    bucket: string;
    parent?: string;
  }) {
    return this.get({
      session,
      path: `/driver/${session.driver}/buckets/${bucket}/objects`,
    });
  }
}
