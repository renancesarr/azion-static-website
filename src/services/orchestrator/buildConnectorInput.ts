import { ConnectorConfig } from './schemas.js';

export function buildConnectorInput(
  connector: ConnectorConfig,
  bucket: { id: string; name: string },
) {
  return {
    name: connector.name,
    originPath: connector.originPath,
    bucketId: connector.bucketId ?? bucket.id,
    bucketName: connector.bucketName ?? bucket.name,
  };
}
