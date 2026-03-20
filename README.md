#  GigShield – AI Powered Parametric Income Insurance for Gig Workers

---

##  Problem Overview

India’s gig economy delivery partners (food, grocery, e-commerce) frequently face income loss due to uncontrollable external disruptions such as heavy rainfall, floods, pollution spikes, curfews, and platform outages.

These disruptions reduce their productive working hours and cause significant weekly income reduction. Currently, there is no dedicated income protection insurance tailored for gig workers.

GigShield is an AI-powered parametric micro-insurance platform that provides automatic claim triggering and instant payout simulation when real-world disruptions occur.

This solution strictly focuses on income protection only and excludes health, accident, or vehicle repair coverage.

---

##  Target Persona

### Food Delivery Partner (Swiggy / Zomato)

- Age Group: 20–35  
- Working Hours: 8–10 hours per day  
- Earnings Pattern: Daily / Weekly dependent  
- Operating Environment: Outdoor deliveries affected by weather and traffic  

---

##  Real-Life Scenario

1. Delivery partner starts shift at 11 AM  
2. Heavy rainfall begins → order demand drops → unsafe travel  
3. Worker loses 3–4 productive delivery hours  
4. GigShield detects rainfall threshold breach via Weather API  
5. Parametric trigger activates → automatic claim approval  
6. Simulated payout credited instantly  

---

##  Solution Overview

GigShield enables:

- AI-based hyper-local risk profiling  
- Dynamic weekly premium calculation  
- Automated parametric claim triggering  
- Real-time disruption monitoring  
- Fraud detection through behavioral anomaly analysis  
- Instant payout simulation  
- Worker & Admin analytics dashboards  

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

| Risk Level | Zone Type | Weekly Premium |
|-----------|----------|---------------|
| Low Risk | Stable Weather / Low Traffic | ₹20 |
| Medium Risk | Moderate Rain / Congestion | ₹35 |
| High Risk | Flood / Severe Pollution Zone | ₹50 |

Premium is dynamically adjusted using AI prediction models based on:

- Historical weather patterns  
- Delivery density  
- Seasonal disruption probability  
- Hyper-local risk score  

---

##  Parametric Claim Triggers

### Environmental Triggers

- Rainfall > 50 mm  
- AQI > 300  
- Temperature > 42°C  
- Flood alerts  

### Social / Platform Triggers

- Curfew announcements  
- Market closures  
- Platform server outage  
- Extreme traffic congestion  

---

##  AI / ML Integration Plan

### Risk Prediction Model

- Predicts disruption probability  
- Generates zone risk score  

### Dynamic Premium Engine

- Adjusts weekly premium based on predicted risk  

### Fraud Detection System

- Detects GPS spoofing patterns  
- Identifies duplicate claims  
- Validates delivery activity logs  
- Flags abnormal claim frequency  

---

#  Adversarial Defense & Anti-Spoofing Strategy

GigShield introduces a multi-layer AI fraud defense architecture to prevent GPS spoofing attacks and coordinated fake claim attempts.

---

##  Differentiation Logic (Genuine vs Spoofed Claims)

### Genuine Worker Indicators

- Continuous movement history before disruption  
- Sudden drop in order activity due to real weather alerts  
- Network signal degradation patterns  
- Delivery acceptance → cancellation trend  
- Multiple workers impacted in same zone  

### Fraud Indicators

- Unrealistic GPS teleport jumps  
- No delivery logs during claimed shift hours  
- Strong signal despite severe weather alert  
- Identical spoof patterns across multiple users  
- Mock-location / rooted device detection  

Each claim is assigned a **Fraud Risk Score (0–100).**

---

##  Multi-Source Data Signals (Beyond GPS)

### Mobility Intelligence

- Accelerometer & gyroscope motion  
- Route map matching  
- Ride vibration signature  

### Network Intelligence

- Tower triangulation mismatch  
- IP geolocation anomaly  
- Device fingerprint validation  

### Platform Intelligence

- Order timestamps  
- Delivery density comparison  
- Idle time anomaly detection  

### Environmental Correlation

- Hyper-local weather severity  
- Traffic congestion signals  
- Flood / AQI sensor data  

### Collective Fraud Detection

- Graph-based anomaly detection  
- Coordinated claim burst identification  
- Peer similarity clustering  

---

##  UX Balance Strategy

| Claim Risk | System Action |
|-----------|--------------|
| Low Risk | Instant payout |
| Medium Risk | Background verification |
| High Risk | Temporary hold + worker notification |

Worker-friendly safeguards:

- Network drop grace window  
- Transparent claim status tracker  
- Partial payout release  
- Appeal mechanism  

---

##  Dashboard Features

### Worker Dashboard

- Active coverage  
- Risk score visualization  
- Claim history  
- Earnings protected summary  

### Admin Dashboard

- Policy analytics  
- Claim frequency trends  
- Zone-wise risk heatmap  
- Fraud alerts  

---

##  Technology Stack

### Frontend
React.js + Tailwind CSS  

### Backend
Node.js + Express.js  

### Database
MongoDB Atlas  

### AI Layer
Python + Scikit-learn + FastAPI  

### APIs
OpenWeather API  
Traffic API  
Delivery Platform Mock API  
Razorpay Sandbox  

### Deployment
Vercel (Frontend)  
Render / Railway (Backend & AI Service)  

---

##  Platform Choice Justification

A Responsive Web Application is selected because:

- Faster MVP development  
- Easy accessibility for judges  
- Better analytics visualization  
- Simplified deployment  

Future scope includes Mobile Application support.

---

##  Innovation Highlights

- Zero-touch automated insurance claims  
- Weekly micro-insurance pricing  
- Hyper-local AI risk prediction  
- GPS spoof-resistant claim system  
- Collective fraud intelligence  

---

##  Future Scope

- Mobile app with real-time alerts  
- Gamified safe-delivery rewards  
- Community risk pooling  
- Earnings prediction assistant  
- Government scheme integrations  

---
