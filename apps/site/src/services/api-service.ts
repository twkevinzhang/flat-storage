import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ApiService {
  private axios: AxiosInstance;

  constructor(baseUrl?: string) {
    this.axios = axios.create({
      baseURL: baseUrl ?? (import.meta.env.VITE_API_BASE as string) ?? '',
      timeout: 3000,
    });
  }

  get<T = any>(
    path: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ) {
    return this.axios.get<T>(path, { params, ...config });
  }

  post<T = any>(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.axios.post<T>(path, data, config);
  }

  fetchFiles(params?: Record<string, any>) {
    return this.get('/storage/gcs/bucket/storage-403503-test/records', params);
  }

  fetchFile(path: string) {
    return this.get(`/api/files/${encodeURIComponent(path)}`);
  }

  createFile(payload: any) {
    return this.post('/api/files', payload);
  }
}
