export interface Object {
  id: string;
  path: string;
  md5Hash?: string; // base64
  sizeBytes: number;
  deletedAt: Date | null; // ISO8601 2023-12-18T16:00:00.000Z
  mimeType?: string;
}
