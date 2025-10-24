export interface PostDeployPathEntry {
  path: string;
  expectedStatus: number;
  headers: Record<string, string>;
  bodyIncludes: string[];
}
