const admin = require('firebase-admin');

let serviceAccount = null;
const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountStr) {
    try {
        serviceAccount = JSON.parse(serviceAccountStr);

        // Ensure the private key is properly formatted (it might need it if not already)
        if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        console.log('Firebase Service Account parsed successfully');
    } catch (error) {
        console.error('ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Check your .env file.');
        console.error('Parsing error:', error.message);
    }
} else {
    console.warn('CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing');
}

if (serviceAccount && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

if (!db) console.error('Firestore initialization failed - db is null');
if (!auth) console.error('Firebase Auth initialization failed - auth is null');

module.exports = { admin, db, auth };
