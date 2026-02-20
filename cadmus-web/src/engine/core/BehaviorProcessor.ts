import { BehaviorSchema, IBehaviorGroupProcessor, ProcessingContext } from '../types';

export class BehaviorProcessor {
    private processors: Map<string, IBehaviorGroupProcessor> = new Map();

    registerProcessor(processor: IBehaviorGroupProcessor) {
        this.processors.set(processor.id, processor);
    }

    async processSchema(schema: BehaviorSchema, context: ProcessingContext) {
        console.log(`[Engine] Processing schema for doc ${context.docId}...`);
        
        for (const group of schema.groups) {
            const processor = this.processors.get(group.id);
            if (processor) {
                try {
                    await processor.process(group, context);
                } catch (e) {
                    console.error(`[Engine] Error processing group ${group.id}:`, e);
                }
            } else {
                console.warn(`[Engine] No processor found for group ${group.id}`);
            }
        }
    }
}

export const engine = new BehaviorProcessor();
