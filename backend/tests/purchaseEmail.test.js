const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const { isAuthorizedEmail, authorizedEmailMessage } = require('../utils/purchaseEmail');

const approvedEmails = [
    'john@huntsmanoptics.com', 'staff@huntsmanoptics.com', 'admin@huntsmanoptics.com',
    'greg@spencerimports.com.au', 'aaron@performanceoutdoors.com.au',
    ' STAFF@HUNTSMANOPTICS.COM ', ' GREG@SPENCERIMPORTS.COM.AU ',
    ' AARON@PERFORMANCEOUTDOORS.COM.AU ', 'first.last+tag@huntsmanoptics.com'
];
const deniedEmails = [
    undefined, null, '', 42, 'user@gmail.com', 'user@spencerimports.com.au',
    'user@performanceoutdoors.com.au', 'fake@huntsmanoptics.com.example.com',
    'someone@not-huntsmanoptics.com', 'staff@huntsmanoptics.com.au',
    'staff@sub.huntsmanoptics.com', 'greg+other@spencerimports.com.au',
    'aaron+other@performanceoutdoors.com.au', '@huntsmanoptics.com',
    'invalid@@huntsmanoptics.com', 'invalid user@huntsmanoptics.com',
    'invalid!user@huntsmanoptics.com'
];

test('frontend and backend match the requested email regex', async () => {
    const frontendPath = path.resolve(__dirname, '../../frontend/src/utils/purchaseEmail.js');
    const frontendPolicy = await import(pathToFileURL(frontendPath).href);
    assert.equal(frontendPolicy.authorizedEmailMessage, authorizedEmailMessage);
    for (const [emails, expected] of [[approvedEmails, true], [deniedEmails, false]]) {
        for (const email of emails) {
            assert.equal(isAuthorizedEmail(email), expected, String(email));
            assert.equal(frontendPolicy.isAuthorizedEmail(email), expected, String(email));
        }
    }
});

// Test the real submission controller and public routes, with database,
// Firebase and email services isolated from external systems.
const savedRequests = [];
const sentEmails = [];
const stubModule = (modulePath, exports) => {
    const id = require.resolve(modulePath);
    require.cache[id] = { id, filename: id, loaded: true, exports };
};
stubModule('../config/firebase', {
    auth: { verifyIdToken: async () => ({ uid: 'admin', email: 'admin@example.com' }) },
    db: {
        collection: () => ({
            add: async (data) => {
                savedRequests.push(data);
                return { id: 'test-request' };
            },
            doc: () => ({ get: async () => ({ exists: true, data: () => ({ role: 'admin' }) }) })
        })
    }
});
stubModule('../services/emailService', { sendEmail: async (to) => sentEmails.push(to) });
stubModule('../services/cronService', { initCron: () => {} });
stubModule('../controllers/productController', {
    getProducts: (req, res) => res.json([{ name: 'Test product' }]),
    addProduct: (req, res) => res.json({}),
    deleteProduct: (req, res) => res.json({})
});

let server;
let baseUrl;
before(async () => {
    server = require('../server').listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
});

const requestBody = (publicEmail) => ({
    publicEmail,
    email: 'staff-recipient@example.com',
    employeeName: 'Test Employee',
    storeName: 'Test Store',
    orderDate: '2026-10-07',
    invoiceDate: '2026-10-07',
    productModel: 'Test product',
    discount: '10'
});
const submit = (publicEmail, admin = false) => fetch(`${baseUrl}/api/${admin ? 'admin' : 'public'}/purchase-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(admin ? { Authorization: 'Bearer test-admin' } : {}) },
    body: JSON.stringify(requestBody(publicEmail))
});

test('the product list is still available without signing in', async () => {
    assert.equal((await fetch(`${baseUrl}/api/products`)).status, 200);
});

test('anonymous submissions accept all authorized contact emails and save normalized values', async () => {
    for (const email of approvedEmails) {
        const response = await submit(email);
        assert.equal(response.status, 201, email);
        const normalizedEmail = email.trim().toLowerCase();
        assert.equal(savedRequests.at(-1).publicEmail, normalizedEmail);
        assert.equal(sentEmails.at(-1), normalizedEmail);
        assert.equal(savedRequests.at(-1).email, 'staff-recipient@example.com');
    }
});

test('unauthorized contact emails are rejected before saving or sending emails', async () => {
    const savedCount = savedRequests.length;
    const sentCount = sentEmails.length;
    for (const email of deniedEmails) {
        const response = await submit(email);
        assert.equal(response.status, 400, String(email));
        assert.equal((await response.json()).error, authorizedEmailMessage);
    }
    assert.equal(savedRequests.length, savedCount);
    assert.equal(sentEmails.length, sentCount);
});

test('admin authentication is unchanged and validates the entered contact email', async () => {
    assert.equal((await submit('john@huntsmanoptics.com', true)).status, 201);
    assert.equal((await submit('user@gmail.com', true)).status, 400);
});
