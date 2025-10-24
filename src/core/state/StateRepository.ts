export interface StateRepository {
  read<T>(relativePath: string): Promise<T | undefined>;
  write<T>(relativePath: string, data: T): Promise<void>;
}
