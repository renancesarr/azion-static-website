export interface DomainRecord {
  id: string;
  name: string;
  edgeApplicationId: string;
  isActive: boolean;
  cname: string;
  createdAt: string;
  raw: unknown;
}
