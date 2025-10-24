import { performance } from 'node:perf_hooks';
import { Clock } from './Clock.js';

export class SystemClock implements Clock {
  now(): number {
    return performance.now();
  }
}
