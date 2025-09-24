export interface Object {
  id: string;
  path: string;
  size: number;
  deletedAt: Date | null; // ISO 8601
}
