use cadmus_kernel::domain::logic::aggregator::LogicEngine;
use cadmus_kernel::domain::logic::integrity::IntegrityEngine;
use cadmus_kernel::domain::archetypes::AggregationRule;
use serde_json::json;

#[test]
fn test_aggregator_avg_completion() {
    let rule = AggregationRule {
        target: "progress".to_string(),
        source: "children".to_string(),
        filter: json!({"class_id": "task"}),
        calc: "avg_completion".to_string(),
    };

    let children = vec![
        json!({"status": "done"}),
        json!({"status": "todo"}),
        json!({"status": "done"}),
        json!({"status": "blocked"}),
    ];

    let result = LogicEngine::calculate_aggregation(&children, &rule).unwrap();
    // 2 out of 4 completed = 50%
    assert_eq!(result, json!(50));
}

#[test]
fn test_aggregator_sum_value() {
    let rule = AggregationRule {
        target: "balance".to_string(),
        source: "children".to_string(),
        filter: json!({"class_id": "asset"}),
        calc: "sum_value".to_string(),
    };

    let children = vec![
        json!({"value": 100.0}),
        json!({"value": 250.50}),
        json!({"value": 50.0}),
    ];

    let result = LogicEngine::calculate_aggregation(&children, &rule).unwrap();
    assert_eq!(result, json!(400.5));
}

#[test]
fn test_integrity_chain() {
    let prev_hash = "GENESIS";
    let user_id = "user-123";
    let action = "CREATE_DOC";
    let details = "{\"title\": \"Sovereign Doc\"}";
    
    let hash1 = IntegrityEngine::calculate_audit_hash(
        Some(user_id), 
        None, 
        action, 
        details, 
        Some(prev_hash)
    );

    let is_valid = IntegrityEngine::verify_link(
        &hash1,
        Some(user_id),
        None,
        action,
        details,
        Some(prev_hash)
    );

    assert!(is_valid);

    // Test chain corruption
    let is_corrupted = IntegrityEngine::verify_link(
        &hash1,
        Some(user_id),
        None,
        action,
        "tampered details",
        Some(prev_hash)
    );

    assert!(!is_corrupted);
}
