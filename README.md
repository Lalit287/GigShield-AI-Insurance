# GigShield – AI Powered Parametric Income Insurance for Gig Workers

##  Problem Overview

India’s gig economy delivery partners (food, grocery, e-commerce) frequently face income loss due to uncontrollable external disruptions such as heavy rainfall, floods, pollution spikes, curfews, and platform outages.

These disruptions can reduce their working hours and result in significant weekly income reduction. Currently, there is no dedicated insurance solution that protects gig workers from such income loss.

GigShield is an AI-powered parametric insurance platform designed to provide automatic income protection coverage with real-time claim triggering and instant payout simulation.

This solution strictly focuses on **income protection only** and excludes health, accident, or vehicle repair coverage.

---

##  Target Persona

### Food Delivery Partner (Swiggy / Zomato)

* Age Group: 20–35
* Working Hours: 8–10 hours per day
* Earnings Pattern: Daily / Weekly dependent
* Operating Environment: Outdoor deliveries affected by weather and traffic

### Real-Life Scenario

1. Delivery partner starts shift at 11 AM
2. Heavy rainfall begins → order demand drops → travel becomes unsafe
3. Worker loses 3–4 hours of productive delivery time
4. GigShield detects rainfall threshold breach via Weather API
5. Parametric trigger activates → automatic claim approval
6. Simulated instant payout credited to worker wallet

---

##  Solution Overview

GigShield platform enables:

* AI-based hyper-local risk profiling
* Dynamic weekly premium calculation
* Automated parametric claim triggering
* Fraud detection through anomaly analysis
* Real-time disruption monitoring
* Instant payout simulation
* Worker & Admin analytics dashboards

---

##  Application Workflow

1. User Registration & Persona Selection
2. Delivery Zone Risk Assessment
3. Weekly Premium Recommendation
4. Policy Activation
5. Real-Time Monitoring of Disruption Triggers
6. Automatic Claim Initiation
7. Instant Payout Simulation
8. Dashboard Insights

---

##  Weekly Premium Pricing Model

Premium pricing is aligned with gig workers’ weekly earning cycle.

| Risk Level  | Zone Type                     | Weekly Premium |
| ----------- | ----------------------------- | -------------- |
| Low Risk    | Stable Weather / Low Traffic  | ₹20            |
| Medium Risk | Moderate Rain / Congestion    | ₹35            |
| High Risk   | Flood / Severe Pollution Zone | ₹50            |

Premium is dynamically adjusted using AI risk prediction models based on:

* Historical weather patterns
* Delivery activity density
* Seasonal disruption probability
* Hyper-local risk score

---

##  Parametric Claim Triggers

Claims are automatically triggered when predefined external disruption thresholds are crossed.

### Environmental Triggers

* Rainfall > 50 mm
* AQI > 300
* Temperature > 42°C
* Flood alerts

### Social / Platform Triggers

* Curfew announcements
* Market / zone closures
* Platform server outage (mock API)
* Extreme traffic congestion

---

##  AI / ML Integration Plan

### 1. Risk Prediction Model

* Uses historical environmental and activity datasets
* Predicts probability of income disruption
* Generates zone risk score

### 2. Dynamic Premium Engine

* Adjusts weekly premium using predicted disruption likelihood
* Offers personalized coverage

### 3. Fraud Detection System

* Detects GPS spoofing patterns
* Identifies duplicate claims
* Validates delivery activity logs
* Flags abnormal claim frequency

---

##  Dashboard Features

### Worker Dashboard

* Active weekly coverage
* Risk score visualization
* Earnings protected summary
* Claim history

### Admin Dashboard

* Policy distribution analytics
* Claim frequency trends
* Zone-wise risk heatmap
* Predicted disruption insights

---

##  Technology Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### AI Layer

* Python
* Scikit-learn
* FastAPI

### External APIs

* OpenWeather API
* Mock Traffic API
* Mock Delivery Platform API
* Razorpay Sandbox (Payout Simulation)

### Deployment

* Vercel (Frontend)
* Render / Railway (Backend & AI Service)

---

##  Platform Choice Justification

A **Responsive Web Application** is selected because:

* Faster MVP development within hackathon timeline
* Easy accessibility for judges via browser link
* Better visualization for analytics dashboards
* Simplified API testing and deployment

Future scope includes Mobile App version for real-time tracking and notifications.



---

##  Innovation Highlights

* Zero-touch automated insurance claims
* Weekly micro-insurance pricing model
* Hyper-local AI risk prediction
* Real-time disruption intelligence
* Income protection focused design

---

##  Future Scope

* Mobile application support
* Gamified safe-delivery rewards
* Community risk pooling
* Earnings prediction assistant
* Government scheme integrations

---

