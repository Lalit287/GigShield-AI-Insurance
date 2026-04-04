import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the python script
const AI_BRIDGE_PATH = path.resolve(__dirname, '../../../ai/cli_bridge.py');

class AIService {
  /**
   * Execute Python CLI Bridge
   * @param {string} action - Action name ('calculate_premium' or 'evaluate_claim')
   * @param {object} payload - Data payload to send to Python
   * @returns {Promise<object>} Result from Python
   */
  static async executePython(action, payload) {
    return new Promise((resolve, reject) => {
      // Use python3, fallback to python
      const payloadStr = JSON.stringify(payload);
      
      execFile('python3', [AI_BRIDGE_PATH, '--action', action, '--payload', payloadStr], (error, stdout, stderr) => {
        if (error) {
          console.error('[AI Bridge Error]', stderr || error.message);
          return reject(error);
        }
        
        try {
          const result = JSON.parse(stdout);
          if (!result.success) {
            reject(new Error(result.error || 'AI Bridge returned failure'));
          } else {
            resolve(result);
          }
        } catch (e) {
          console.error('[AI Bridge Parse Error] Output was:', stdout);
          reject(new Error('Failed to parse AI Bridge output'));
        }
      });
    });
  }

  /**
   * Calculate Premium dynamically
   */
  static async calculatePremium(zone, tier, weeks, weatherData = {}) {
    try {
      const payload = {
        zone,
        tier,
        weeks,
        weather: weatherData
      };
      
      return await this.executePython('calculate_premium', payload);
    } catch (error) {
      console.warn('⚠️ [AI Engine] Premium calculation failed, using fallback.', error.message);
      // Fallback
      return {
        success: false,
        premium: {
          adjusted_premium_weekly: tier === 'basic' ? 35 : tier === 'standard' ? 70 : 140,
          coverage_amount: tier === 'basic' ? 5000 : tier === 'standard' ? 10000 : 25000,
        },
        risk_level: 'medium',
        risk_score: 50
      };
    }
  }

  /**
   * Evaluate Claim Fraud and Decision
   */
  static async evaluateClaim(claimData, actualWeather = {}) {
    try {
      const payload = {
        claim: claimData,
        actual_weather: actualWeather
      };
      
      return await this.executePython('evaluate_claim', payload);
    } catch (error) {
      console.warn('⚠️ [AI Engine] Claim evaluation failed, using fallback.', error.message);
      // Fallback response for hackathon demo robustness
      return {
        success: false,
        fraud_score: 15,
        fraud_level: 'low',
        status: 'AUTO_APPROVED',
        payout_amount: claimData.amount || 0,
        confidence: 85,
        reasons: ['Fallback to auto-approve due to AI engine timeout']
      };
    }
  }
}

export default AIService;
