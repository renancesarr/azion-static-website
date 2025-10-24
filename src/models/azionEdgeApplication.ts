export interface AzionEdgeApplication {
  id: string;
  name: string;
  delivery_protocol: string;
  origin_protocol_policy: string;
  caching: Record<string, unknown>;
  active: boolean;
  waf: {
    active: boolean;
  };
  created_at?: string;
  [key: string]: unknown;
}
