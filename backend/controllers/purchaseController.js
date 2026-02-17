const { db } = require('../config/firebase');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

const COLLECTION_NAME = 'purchaseRequests';

// Create new purchase request
exports.createPurchaseRequest = async (req, res) => {
    try {
        const {
            storeName, employeeName, orderDate, invoiceDate,
            productModel, serialNumber, fob, discount,
            rebate, email
        } = req.body;

        const responseToken = crypto.randomBytes(32).toString('hex');

        // Use authenticated user if available, otherwise fallback to system default
        const adminEmail = req.user?.email || process.env.ADMIN_EMAIL || 'admin@huntsmanoptics.com';
        const adminName = req.user?.name || 'Staff Member';

        const newRequest = {
            storeName,
            employeeName,
            orderDate: new Date(orderDate).toISOString(),
            invoiceDate: new Date(invoiceDate).toISOString(),
            productModel,
            serialNumber: serialNumber || '',
            fob: fob || '',
            discount,
            rebate: rebate || '',
            email: email || '',
            adminEmail, // Save who created it
            adminName,
            status: 'Pending',
            responseToken,
            tokenUsed: false,
            reminderCount: 0,
            emailSentLog: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await db.collection(COLLECTION_NAME).add(newRequest);
        const requestData = { id: docRef.id, ...newRequest };

        // Send email to the Staff Member (Sight App Email)
        // Fallback to env var only if email not provided (though form makes it required)
        const recipientEmail = email || process.env.REBATE_EMAIL;

        if (recipientEmail) {
            await sendEmail(recipientEmail, 'purchaseRequest', {
                request: requestData,
                token: responseToken
            });
        }

        res.status(201).json({ message: 'Purchase Request created and sent successfully', id: docRef.id });

    } catch (error) {
        console.error('Error creating purchase request:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all requests (Admin only)
exports.getPurchaseRequests = async (req, res) => {
    try {
        const { status, store, employee, startDate, endDate } = req.query;
        let query = db.collection(COLLECTION_NAME);

        if (status) query = query.where('status', '==', status);
        // Note: Firestore doesn't support native regex search or partial matching easily without third-party services like Algolia.
        // For basic filtering, we can filter in memory if dataset is small, or use exact matches.
        // Here we'll fetch then filter for store/employee to keep it simple for now, or assume exact match if provided.

        const snapshot = await query.get();
        let requests = [];

        snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() });
        });

        // In-memory filtering for partial matches (Store/Employee)
        if (store) {
            requests = requests.filter(r => r.storeName.toLowerCase().includes(store.toLowerCase()));
        }
        if (employee) {
            requests = requests.filter(r => r.employeeName.toLowerCase().includes(employee.toLowerCase()));
        }
        if (startDate) {
            requests = requests.filter(r => new Date(r.createdAt) >= new Date(startDate));
        }
        if (endDate) {
            requests = requests.filter(r => new Date(r.createdAt) <= new Date(endDate));
        }

        // Sort by createdAt desc
        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single request
exports.getPurchaseRequestById = async (req, res) => {
    try {
        const doc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Request not found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle rebate response
exports.handleResponse = async (req, res) => {
    try {
        const { token } = req.params;
        const { action } = req.query;

        // Query by token
        const snapshot = await db.collection(COLLECTION_NAME).where('responseToken', '==', token).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        const doc = snapshot.docs[0];
        const request = doc.data();

        if (request.tokenUsed) {
            return res.status(400).json({ error: 'This response link has already been used.' });
        }

        let newStatus;
        switch (action) {
            case 'confirm': newStatus = 'Confirmed'; break; // Staff confirmed
            case 'approve': newStatus = 'Approved'; break; // Legacy/Admin override
            case 'reject': newStatus = 'Rejected'; break;
            case 'needinfo': newStatus = 'Need Info'; break;
            default: return res.status(400).json({ error: 'Invalid action' });
        }

        const { note } = req.body;

        const updates = {
            status: newStatus,
            responseType: action,
            responseNote: note || '',
            responseTimestamp: new Date().toISOString(),
            tokenUsed: true,
            updatedAt: new Date().toISOString()
        };

        await db.collection(COLLECTION_NAME).doc(doc.id).update(updates);

        // Notify the Admin about the response
        const targetAdminEmail = process.env.ADMIN_EMAIL || request.adminEmail;
        if (targetAdminEmail) {
            await sendEmail(targetAdminEmail, 'responseNotification', {
                request: { ...request, ...updates },
                action: action,
                note: note || ''
            });
        }

        res.json({ message: 'Response recorded successfully', status: newStatus });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get request details by token (Public)
exports.getRequestByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const snapshot = await db.collection(COLLECTION_NAME).where('responseToken', '==', token).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        const doc = snapshot.docs[0];
        const request = doc.data();

        // Only return necessary public info
        const publicInfo = {
            storeName: request.storeName,
            employeeName: request.employeeName,
            productModel: request.productModel,
            discount: request.discount,
            serialNumber: request.serialNumber,
            fob: request.fob,
            rebate: request.rebate,
            orderDate: request.orderDate,
            invoiceDate: request.invoiceDate,
            status: request.status,
            tokenUsed: request.tokenUsed
        };

        res.json(publicInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete request (Admin only)
exports.deletePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        await docRef.delete();
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.testReminder = async (req, res) => {
    res.json({ message: 'Use the cron service to test reminders' });
};
