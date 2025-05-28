# app/fraud_api.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from .rule_engine import check_rules

app = FastAPI()

# Load models
models = {
    "random_forest": joblib.load("models/random_forest_model.pkl"),
    "gradient_boosting": joblib.load("models/gradient_boosting_model.pkl"),
    "logistic_regression": joblib.load("models/logistic_regression_model.pkl"),
    "neural_network": joblib.load("models/neural_network_model.pkl")
}

scaler = joblib.load("models/scaler.pkl")

# Define transaction input
class Transaction(BaseModel):
    transaction_id: str
    transaction_amount: float
    transaction_channel: str
    transaction_payment_mode: str
    payment_gateway_bank: str
    payer_email: str
    payer_mobile: str
    payer_card_brand: str
    payer_device: str
    payer_browser: str
    payee_id: str

@app.post("/predict/{model_name}")
async def predict_fraud(model_name: str, txn: Transaction):
    if model_name not in models:
        raise HTTPException(status_code=400, detail="Model not found!")

    txn_data = txn.dict()
    
    # Apply rule engine first
    rule_result = check_rules(txn_data)
    if rule_result['is_fraud']:
        return {
            "transaction_id": txn_data["transaction_id"],
            "is_fraud": True,
            "fraud_source": "rule",
            "fraud_reason": rule_result["reason"],
            "fraud_score": 1.0
        }

    # Prepare for AI model
    input_features = [
        txn_data['transaction_amount'],
        txn_data['transaction_channel'],
        txn_data['transaction_payment_mode'],
        txn_data['payment_gateway_bank'],
        txn_data['payer_email'],
        txn_data['payer_mobile'],
        txn_data['payer_card_brand'],
        txn_data['payer_device'],
        txn_data['payer_browser'],
        txn_data['payee_id'],
    ]
    
    # Label encode manually like you did in training (or load encoders dynamically)
    label_encodings = {k: hash(str(k)) % 1000 for k in input_features[1:]}
    input_encoded = [
        input_features[0]] + list(label_encodings.values())
    
    input_scaled = scaler.transform([input_encoded])

    # AI model prediction
    model = models[model_name]
    prob = model.predict_proba(input_scaled)[0][1]
    is_fraud = prob > 0.5

    return {
        "transaction_id": txn_data["transaction_id"],
        "is_fraud": bool(is_fraud),
        "fraud_source": "model",
        "fraud_reason": "AI-based prediction",
        "fraud_score": round(prob, 4)
    }

@app.get("/")
def root():
    return {"message": "Fraud Detection API Running ✅"}
