#!/usr/bin/env bash

# ============================================================================
# GigShield AI Engine - Quick Start Guide
# ============================================================================
# This script sets up the Python environment and demonstrates AI modules
# Run with: bash quickstart.sh

set -e

echo "🚀 GigShield AI Engine - Quick Start"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Python installation
echo -e "${BLUE}1. Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✓ Python ${PYTHON_VERSION} installed${NC}"
echo ""

# Create virtual environment
echo -e "${BLUE}2. Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${BLUE}3. Activating virtual environment...${NC}"
source venv/bin/activate || . venv/Scripts/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Upgrade pip
echo -e "${BLUE}4. Upgrading pip and setuptools...${NC}"
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
echo -e "${GREEN}✓ pip upgraded${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}5. Installing dependencies...${NC}"
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Display usage instructions
echo -e "${BLUE}6. Quick Start Guide${NC}"
echo "===================="
echo ""

# Option 1: Run example
echo -e "${YELLOW}Option 1: Run Complete Example${NC}"
echo "  Command: python example_usage.py"
echo "  Shows: Full end-to-end claim processing pipeline"
echo ""

# Option 2: Run tests
echo -e "${YELLOW}Option 2: Run Unit Tests${NC}"
echo "  Command: pytest test_ai_modules.py -v"
echo "  Tests: Risk, fraud, premium, decision, integration tests"
echo ""

# Option 3: Start API server
echo -e "${YELLOW}Option 3: Start FastAPI Server (Development)${NC}"
echo "  Command: uvicorn api_wrapper:app --reload --host 0.0.0.0 --port 8000"
echo "  Then visit: http://localhost:8000/docs"
echo ""

# Option 4: Individual module
echo -e "${YELLOW}Option 4: Run Individual Module${NC}"
echo "  Python console:"
echo "    >>> from risk_calculator import RiskCalculator, WeatherData"
echo "    >>> weather = WeatherData(rainfall_mm=65, aqi=320, temperature_c=38, humidity_pct=75)"
echo "    >>> risk = RiskCalculator.calculate_risk_score(weather, 'Dilsukhnagar')"
echo "    >>> print(risk)"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Available Modules:${NC}"
echo "  • risk_calculator.py      - Weather-based risk scoring"
echo "  • fraud_detector.py       - Rule-based fraud detection"
echo "  • premium_engine.py       - Dynamic premium pricing"
echo "  • claim_decision.py       - Automated claim decisions"
echo "  • utils.py                - Validation, logging, serialization"
echo "  • api_wrapper.py          - FastAPI REST endpoints"
echo "  • example_usage.py        - Complete workflow example"
echo "  • test_ai_modules.py      - Comprehensive test suite"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo "  • README.md               - Full feature documentation"
echo "  • requirements.txt        - Python dependencies"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Run example: python example_usage.py"
echo "  2. Run tests: pytest test_ai_modules.py -v"
echo "  3. Start API: uvicorn api_wrapper:app --reload"
echo ""
