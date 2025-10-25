import { HttpClient } from '../../core/http/HttpClient.js';
import { StateRepository } from '../../core/state/StateRepository.js';
import { Logger } from '../../core/logging/Logger.js';

export interface EdgeDependencies {
  apiBase: string;
  http: HttpClient;
  state: StateRepository;
  logger: Logger;
}
