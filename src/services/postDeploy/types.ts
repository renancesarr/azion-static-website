export type FetchFn = typeof fetch;

export interface PostDeployDependencies {
  fetch: FetchFn;
  now: () => number;
  setTimeout: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
}
