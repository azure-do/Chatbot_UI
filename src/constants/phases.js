// Map phases to expressions as per Specification Section 7
export const phaseToExpressionMap = {
  welcome: 'smile',
  gathering: 'empathy',
  casual: 'friendliness',
  explanation: 'explanation',
  proposal: 'confidence',
  closing: 'closing',
  celebration: 'celebration',
};

export const PHASE_ORDER = [
  'welcome',
  'gathering',
  'explanation',
  'proposal',
  'closing',
  'celebration',
];
