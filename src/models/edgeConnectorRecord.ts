export interface EdgeConnectorRecord {
  id: string;
  name: string;
  bucketId: string;
  bucketName?: string;
  originPath?: string;
  createdAt: string;
  raw: unknown;
}
