// Keep this pattern in sync with frontend/src/utils/purchaseEmail.js.
const authorizedEmailPattern = /^(?:[A-Za-z0-9._%+-]+@huntsmanoptics\.com|greg@spencerimports\.com\.au|aaron@performanceoutdoors\.com\.au)$/;
const authorizedEmailMessage = 'Please enter an authorized Huntsman Optics email address.';
const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const isAuthorizedEmail = (email) => authorizedEmailPattern.test(normalizeEmail(email));

module.exports = { normalizeEmail, isAuthorizedEmail, authorizedEmailMessage };
