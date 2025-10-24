export interface AzionBucketPayload {
  id: string;
  name: string;
  edge_access?: string;
  description?: string;
  region?: string;
  created_at?: string;
  [key: string]: unknown;
}
