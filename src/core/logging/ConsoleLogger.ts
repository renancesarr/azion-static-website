import { Logger } from './Logger.js';

export class ConsoleLogger implements Logger {
  info(message: string): void {
    console.info(message);
  }

  error(message: string): void {
    console.error(message);
  }
}
