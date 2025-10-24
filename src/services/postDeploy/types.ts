import { HttpClient } from '../../core/http/HttpClient.js';
import { Logger } from '../../core/logging/Logger.js';
import { Clock } from '../../core/time/Clock.js';

export interface PostDeployDependencies {
  http: HttpClient;
  logger: Logger;
  clock: Clock;
  setTimeout: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
}
