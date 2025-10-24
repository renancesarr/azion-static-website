export interface AzionDomain {
  id: string;
  name: string;
  cname: string;
  edge_application_id: string;
  cnames: {
    dns_name: string;
    ttl: number;
  }[];
  active: boolean;
  created_at?: string;
  [key: string]: unknown;
}
