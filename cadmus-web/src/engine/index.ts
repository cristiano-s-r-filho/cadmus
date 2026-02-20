import { engine } from './core/BehaviorProcessor';
import { AggregationGroup } from './groups/AggregationGroup';

// Registro de Processadores de Grupo
engine.registerProcessor(new AggregationGroup());

export * from './types';
export { engine };
