# GigShield – AI Powered Parametric Insurance for Gig Workers

##  Problem Statement

Platform-based delivery workers such as food delivery, grocery delivery, and e-commerce delivery partners face frequent income loss due to external disruptions like heavy rainfall, floods, pollution, app outages, or sudden curfews.

Currently, there is no dedicated income protection solution for gig workers. When such disruptions occur, workers lose their daily earnings without any financial safety net.

GigShield aims to solve this problem by building an AI-enabled parametric insurance platform that provides automatic income protection coverage with instant claim payouts.

This solution focuses strictly on protecting LOSS OF INCOME caused by external disruptions and does not cover vehicle damage, health insurance, or accident-related expenses.

---

##  Target Persona

### Persona: Food Delivery Partner (Example – Swiggy/Zomato Rider)

**Profile**
- Age: 22–35
- Works 8–10 hours daily
- Weekly earnings: ₹5,000 – ₹8,000
- Dependent on weather and traffic conditions

### Scenario Example

1. Rider starts shift at 10 AM.
2. Heavy rainfall begins → deliveries reduce drastically.
3. Rider loses 4 hours of working time → income loss.
4. GigShield detects rainfall threshold breach.
5. Claim is auto-triggered → instant payout is credited.

---

##  Solution Overview

GigShield is an AI-powered parametric insurance platform that:

- Assesses delivery zone risk using AI models
- Calculates dynamic weekly premium
- Monitors real-time disruption triggers
- Automatically initiates claims
- Provides instant payout to workers
- Prevents fraudulent claims using anomaly detection

---

##  Application Workflow

1. Worker Registration & Onboarding
2. Risk Profiling based on delivery location
3. Weekly Premium Calculation
4. Policy Activation
5. Real-Time Disruption Monitoring
6. Automatic Claim Trigger
7. Instant Payout Processing
8. Dashboard Analytics for worker & admin

---

##  Weekly Premium Pricing Model

GigShield follows a simple **Weekly Premium Model** aligned with gig worker earning cycles.

### Example Pricing Logic

| Risk Level | Area Type | Weekly Premium |
|-----------|-----------|---------------|
| Low Risk | Safe Zone | ₹20 |
| Medium Risk | Moderate Rain / Traffic | ₹35 |
| High Risk | Flood/Extreme Pollution Zone | ₹50 |

Premium is dynamically adjusted using AI risk prediction models.

---

##  Parametric Claim Triggers

Claims are automatically triggered when predefined conditions are met.

### Environmental Triggers
- Rainfall > 50mm
- Temperature > 42°C
- AQI > 300
- Flood alerts

### Social / Platform Triggers
- Curfew announcements
- Delivery zone closures
- Platform server outage (mock API)
- Traffic congestion beyond threshold

---

##  AI / ML Integration Plan

AI is used in three key modules:

### 1. Risk Prediction Model
- Uses historical weather & delivery data
- Predicts probability of income disruption
- Helps in premium personalization

### 2. Dynamic Premium Engine
- Adjusts premium weekly based on:
  - Zone risk score
  - Worker activity pattern
  - Seasonal disruption trends

### 3. Fraud Detection System
- Detects GPS spoofing
- Identifies duplicate claims
- Validates worker activity logs
- Flags anomaly patterns in claims

---

##  External Integrations

- Weather API (OpenWeather / Mock API)
- Traffic Data API (Simulated)
- Platform Data API (Mock Swiggy/Zomato server status)
- Payment Gateway Sandbox (Razorpay / Stripe test mode)

---

##  Dashboard Features

### Worker Dashboard
- Active weekly coverage
- Earnings protected
- Claim history
- Risk score

### Admin Dashboard
- Total policies issued
- Claim frequency analytics
- Loss ratio insights
- Risk heatmap by zones

---

##  Proposed Tech Stack

### Frontend
- ReactJS / Flutter (Mobile First Design)

### Backend
- NodeJS / Spring Boot

### Database
- MongoDB / MySQL

### AI / ML
- Python
- Scikit-Learn / TensorFlow

### Cloud
- AWS / Azure (Free Tier)

---

##  Development Plan (Phase Wise)

### Phase 1
- Ideation
- UI Wireframes
- Risk logic design
- AI model planning

### Phase 2
- User onboarding module
- Premium calculation engine
- Claim automation
- API integration

### Phase 3
- Advanced fraud detection
- Instant payout simulation
- Analytics dashboard
- Final optimization

---

##  Innovation Highlights

- Fully automated zero-touch insurance claims
- Weekly flexible micro-insurance model
- AI powered hyper-local risk pricing
- Income protection instead of traditional asset insurance
- Real-time disruption intelligence engine

---

##  Future Scope

- Multi-platform worker coverage
- Gamified insurance rewards
- Community risk pooling
- Predictive earnings planner
- Government scheme integration

---




