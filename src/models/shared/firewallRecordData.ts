export interface FirewallRecordData {
  id: string;
  name: string;
  domainIds: string[];
  isActive: boolean;
  createdAt: string;
  raw: unknown;
}
