export interface PostDeployPathEntryData {
  path: string;
  expectedStatus: number;
  headers: Record<string, string>;
  bodyIncludes: string[];
}
