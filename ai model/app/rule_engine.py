# app/rule_engine.py

def check_rules(transaction):
    # Example Rule Set (you can make this dynamic later)
    rules = [
        {"field": "transaction_amount", "operator": ">", "value": 5000, "reason": "High value transaction"},
        {"field": "transaction_channel", "operator": "==", "value": "web", "reason": "Web transaction"},
    ]
    
    for rule in rules:
        txn_value = transaction.get(rule['field'])
        if rule['operator'] == ">" and txn_value > rule['value']:
            return {"is_fraud": True, "reason": rule['reason']}
        if rule['operator'] == "==" and txn_value == rule['value']:
            return {"is_fraud": True, "reason": rule['reason']}
    return {"is_fraud": False, "reason": "No rule triggered"}
