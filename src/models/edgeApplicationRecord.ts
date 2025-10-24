export interface EdgeApplicationRecord {
  id: string;
  name: string;
  deliveryProtocol: string;
  originProtocol: string;
  caching: Record<string, unknown>;
  enableWaf: boolean;
  createdAt: string;
  raw: unknown;
}
