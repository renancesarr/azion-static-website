import { ORCHESTRATION_STATE_DIR } from '../../../../src/services/orchestrator/constants.js';

describe('orchestrator constants', () => {
  it('define diretório de estado', () => {
    expect(ORCHESTRATION_STATE_DIR).toBe('orchestration/runs');
  });
});
