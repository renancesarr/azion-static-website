export interface AzionWafPolicy {
  id: string;
  edge_application_id: string;
  mode: string;
  enabled: boolean;
  updated_at?: string;
  [key: string]: unknown;
}
