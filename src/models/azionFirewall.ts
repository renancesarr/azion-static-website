export interface AzionFirewall {
  id: string;
  name: string;
  domains?: string[];
  is_active?: boolean;
  created_at?: string;
  [key: string]: unknown;
}
