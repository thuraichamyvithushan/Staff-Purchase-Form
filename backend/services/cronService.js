const cron = require('node-cron');
const { db } = require('../config/firebase');
const { sendEmail } = require('./emailService');

const COLLECTION_NAME = 'purchaseRequests';

const initCron = () => {
  // LIVE MODE: Run daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily reminder check...');
    try {
      // Get all pending requests
      const snapshot = await db.collection(COLLECTION_NAME).where('status', '==', 'Pending').get();

      if (snapshot.empty) {
        console.log('No pending requests found.');
        return;
      }

      console.log(`Found ${snapshot.size} pending requests. Checking for reminders...`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach(async (doc) => {
        const request = doc.data();
        const requestId = doc.id;

        // Check if reminder was already sent today
        if (request.lastReminderSent) {
          const lastSent = new Date(request.lastReminderSent);
          lastSent.setHours(0, 0, 0, 0);

          if (lastSent.getTime() === today.getTime()) {
            // Reminder already sent today, skip
            return;
          }
        }

        // Logic to check if it's been 1 day could be added here if needed, 
        // but "daily reminder" implies checking every day for pending items.
        // Assuming every pending item gets a reminder once a day.

        const recipient = request.email;
        // Fallback or specific logic if email is missing?
        if (!recipient) {
          console.log(`Skipping request ${requestId}: No email found.`);
          return;
        }

        try {
          await sendEmail(recipient, 'reminder', {
            request: { id: requestId, ...request },
            token: request.responseToken
          });

          // Update doc
          const emailLog = request.emailSentLog || [];
          emailLog.push({
            sentAt: new Date().toISOString(),
            type: 'reminder'
          });

          await db.collection(COLLECTION_NAME).doc(requestId).update({
            reminderCount: (request.reminderCount || 0) + 1,
            lastReminderSent: new Date().toISOString(),
            emailSentLog: emailLog
          });

          console.log(`Reminder sent for request ${requestId} to ${recipient}`);
        } catch (emailError) {
          console.error(`Failed to send reminder for ${requestId}:`, emailError);
        }
      });
    } catch (error) {
      console.error('Error in daily reminder job:', error);
    }
  });

  console.log('✓ Cron Job Scheduled (LIVE MODE: Daily Reminders at 8:00 AM)');
};

// Check overdues - removed as per new requirements
const checkOverdues = async () => {
  console.log('Manual reminder check triggered');
  // Implement manual trigger logic if needed, reusing the cron logic
};

module.exports = { initCron, checkOverdues };
