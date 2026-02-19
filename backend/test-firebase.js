require('dotenv').config();
const { admin, db, auth } = require('./config/firebase');

console.log('--- Firebase Initialization Test ---');

if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin app initialized.');
    console.log('Project ID:', admin.app().options.credential.projectId || 'N/A');
} else {
    console.log('❌ Firebase Admin app NOT initialized.');
    process.exit(1);
}

if (db) {
    console.log('✅ Firestore (db) is initialized.');
} else {
    console.log('❌ Firestore (db) is NOT initialized.');
}

if (auth) {
    console.log('✅ Firebase Auth is initialized.');
} else {
    console.log('❌ Firebase Auth is NOT initialized.');
}

console.log('--- End of Test ---');
process.exit(0);
