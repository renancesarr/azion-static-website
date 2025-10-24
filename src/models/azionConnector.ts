export interface AzionConnector {
  id: string;
  name: string;
  origin_type: string;
  origin_id: string;
  bucket: {
    id: string;
    name?: string;
  };
  origin_path?: string;
  created_at?: string;
  [key: string]: unknown;
}
