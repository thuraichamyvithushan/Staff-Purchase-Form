const cron = require('node-cron');
const { db } = require('../config/firebase');
const { sendEmail } = require('./emailService');

const COLLECTION_NAME = 'purchaseRequests';

const initCron = () => {
  // TEST MODE: Run every minute (Original: 0 9 * * *)
  cron.schedule('* * * * *', async () => {
    console.log('Running reminder check (TEST MODE: Every Minute)...');
    try {
      const snapshot = await db.collection(COLLECTION_NAME).where('status', '==', 'Pending').get();
      const rebateEmail = process.env.REBATE_EMAIL || 'rebate@example.com';

      if (snapshot.empty) {
        console.log('No pending requests to remind.');
        return;
      }

      const today = new Date().setHours(0, 0, 0, 0);

      snapshot.forEach(async (doc) => {
        const request = doc.data();

        // Skip if reminder sent today (DISABLED FOR TESTING)
        /*
        if (request.lastReminderSent) {
          const lastSent = new Date(request.lastReminderSent).setHours(0, 0, 0, 0);
          if (today === lastSent) return;
        }
        */

        const requestData = { id: doc.id, ...request };
        const recipient = request.email || rebateEmail;

        await sendEmail(recipient, 'reminder', {
          request: requestData,
          token: request.responseToken
        });

        // Update doc
        const emailLog = request.emailSentLog || [];
        emailLog.push({
          sentAt: new Date().toISOString(),
          type: 'reminder'
        });

        await db.collection(COLLECTION_NAME).doc(doc.id).update({
          reminderCount: (request.reminderCount || 0) + 1,
          lastReminderSent: new Date().toISOString(),
          emailSentLog: emailLog
        });

        console.log(`Reminder sent for request ${doc.id} to ${recipient}`);
      });
    } catch (error) {
      console.error('Error in daily reminder job:', error);
    }
  });

  console.log('✓ Cron Job Scheduled (TEST MODE: Every Minute Reminders)');
};

// Check overdues - removed as per new requirements
const checkOverdues = async () => {
  console.log('Manual reminder check triggered');
  // Implement manual trigger logic if needed, reusing the cron logic
};

module.exports = { initCron, checkOverdues };
