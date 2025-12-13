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
