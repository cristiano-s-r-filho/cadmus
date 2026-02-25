-- Migration for the New Behavior Engine (Engine V1):
-- This migration updates the `behavior_rules` JSONB column for specific `classes`
-- to define advanced behavioral logic, such as aggregations.

-- Update `behavior_rules` for the 'ledger' class.
-- Defines an aggregation rule to sum the 'value' property from child documents
-- into the 'total_balance' property of the ledger.
UPDATE classes SET 
    behavior_rules = '{
        "groups": [
            {
                "id": "aggregation",
                "actions": [
                    {
                        "id": "sum_balance",
                        "type": "AGGREGATE",
                        "params": {
                            "target_key": "total_balance",
                            "source_key": "value",
                            "strategy": "sum"
                        }
                    }
                ]
            }
        ]
    }'::jsonb
WHERE id = 'ledger';

-- Update `behavior_rules` for the 'project' class.
-- Defines an aggregation rule to calculate the average completion status
-- from child tasks into the 'progress' property of the project.
UPDATE classes SET 
    behavior_rules = '{
        "groups": [
            {
                "id": "aggregation",
                "actions": [
                    {
                        "id": "calc_progress",
                        "type": "AGGREGATE",
                        "params": {
                            "target_key": "progress",
                            "source_key": "status",
                            "strategy": "avg_completion"
                        }
                    }
                ]
            }
        ]
    }'::jsonb
WHERE id = 'project';
