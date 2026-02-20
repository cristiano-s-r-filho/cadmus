use serde_json::Value;
use crate::domain::archetypes::AggregationRule;

pub struct LogicEngine;

impl LogicEngine {
    /// Calcula o novo valor de uma propriedade baseado em uma regra e dados dos filhos.
    pub fn calculate_aggregation(children_props: &[Value], rule: &AggregationRule) -> Option<Value> {
        match rule.calc.as_str() {
            "avg_completion" => Self::avg_completion(children_props, &rule.filter),
            "sum_value" => Self::sum_value(children_props, &rule.filter, &rule.target),
            _ => None
        }
    }

    fn avg_completion(props: &[Value], _filter: &Value) -> Option<Value> {
        let mut total = 0;
        let mut completed = 0;

        for p in props {
            // Nota: No banco real, precisamos saber a classe de cada filho. 
            // Para este MVP, assumimos que os props passados já estão filtrados pelo repo.
            total += 1;
            let status = p.get("status").and_then(|v| v.as_str()).unwrap_or("");
            if status == "done" || status == "completed" {
                completed += 1;
            }
        }

        if total == 0 { return Some(Value::from(0)); }
        let percentage = (completed as f64 / total as f64) * 100.0;
        Some(Value::from(percentage.round() as i64))
    }

    fn sum_value(props: &[Value], _filter: &Value, target_key: &str) -> Option<Value> {
        let mut sum = 0.0;
        for p in props {
            // Tenta somar o valor da chave alvo ou de uma chave padrão 'value'
            let val = p.get(target_key)
                .or_else(|| p.get("value"))
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            sum += val;
        }
        Some(Value::from(sum))
    }
}
