/**
 * Notification Service
 * Sends SMS/WhatsApp alerts for payouts and policy status
 * (Simulated for demo purposes)
 */
class NotificationService {
  /**
   * Send insurance payout alert via SMS/WhatsApp
   */
  static async sendPayoutNotification(user, claim) {
    const claimIdentifier = claim.claimNumber || claim._id;
    const message = `✨ GigShield Alert: Payout of ₹${claim.amount} for Claim #${claimIdentifier} has been processed via UPI. Funds will reflect in your account shortly. 🛡️`;
    
    // In production, use Twilio/Gupshup
    console.log(`\n\x1b[42m\x1b[30m 📱 [NOTIFICATION SENT] \x1b[0m \x1b[36mSMS to ${user.phone || user.email}:\x1b[0m ${message}`);
    console.log(`\x1b[42m\x1b[30m 🟢 [NOTIFICATION SENT] \x1b[0m \x1b[32mWhatsApp to ${user.phone || user.email}:\x1b[0m ${message}\n`);
    
    return {
      success: true,
      channels: ['SMS', 'WhatsApp'],
      notificationId: `NT-${Date.now()}`
    };
  }

  /**
   * Send Zero-Touch trigger alert
   */
  static async sendZeroTouchAlert(user, triggerType, value) {
    const message = `🚨 GigShield Alert: Extreme ${triggerType} (${value}) detected in your zone. Your Zero-Touch claim has been automatically triggered! 🛡️`;
    
    console.log(`\n\x1b[41m\x1b[37m 🚨 [ZERO-TOUCH ALERT] \x1b[0m \x1b[33mSMS to ${user.phone || user.email}:\x1b[0m ${message}\n`);
    
    return {
      success: true,
      channels: ['SMS']
    };
  }
}

export default NotificationService;
