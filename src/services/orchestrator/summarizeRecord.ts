export function summarizeRecord<T extends { id: string; name?: string }>(record: T): string {
  if ('name' in record && record.name) {
    return `${record.name} (${record.id})`;
  }
  return record.id;
}
