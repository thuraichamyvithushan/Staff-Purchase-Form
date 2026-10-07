// Keep this pattern in sync with backend/utils/purchaseEmail.js.
const authorizedEmailPattern = /^(?:[A-Za-z0-9._%+-]+@huntsmanoptics\.com|greg@spencerimports\.com\.au|aaron@performanceoutdoors\.com\.au)$/;
export const authorizedEmailMessage = 'Please enter an authorized Huntsman Optics email address.';
export const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
export const isAuthorizedEmail = (email) => authorizedEmailPattern.test(normalizeEmail(email));
