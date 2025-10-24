import { CacheRuleConfig } from './schemas.js';
import { CreateRuleInput } from '../edge/index.js';

export function buildRuleInputs(rules: CacheRuleConfig[], edgeApplicationId: string): CreateRuleInput[] {
  if (rules.length === 0) {
    return [
      {
        edgeApplicationId,
        phase: 'request',
        behaviors: [{ name: 'cache' }],
        criteria: [],
        description: 'default-cache-static',
        order: 0,
      },
    ];
  }

  return rules.map((rule, index) => ({
    edgeApplicationId,
    phase: rule.phase ?? 'request',
    behaviors: rule.behaviors.length > 0 ? rule.behaviors : [{ name: 'cache' }],
    criteria: rule.criteria,
    description: rule.description ?? `rule-${index + 1}`,
    order: rule.order ?? index,
  }));
}
