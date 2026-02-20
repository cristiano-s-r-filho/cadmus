-- Migração para o Novo Motor de Comportamento (Engine V1)

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
