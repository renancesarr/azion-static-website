import { HttpClient } from '../../core/http/HttpClient.js';
import { Clock } from '../../core/time/Clock.js';
import { StateRepository } from '../../core/state/StateRepository.js';
import { Logger } from '../../core/logging/Logger.js';

export interface ValidationDependencies {
  http: HttpClient;
  clock: Clock;
  state: StateRepository;
  logger: Logger;
  setTimeout: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
  readDir: (path: string) => Promise<string[]>;
  readFile: (path: string, encoding: BufferEncoding) => Promise<string>;
}
