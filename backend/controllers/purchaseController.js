const { db } = require('../config/firebase');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

const COLLECTION_NAME = 'purchaseRequests';

exports.createPurchaseRequest = async (req, res) => {
    try {
        const {
            storeName, employeeName, orderDate, invoiceDate,
            productModel, serialNumber, fob, discount,
            rebate, email, publicEmail
        } = req.body;

        const responseToken = crypto.randomBytes(32).toString('hex');

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
            publicEmail: publicEmail || '',
            adminEmail,
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

        // Send confirmation email to the person who filled the form (publicEmail)
        const confirmationEmail = publicEmail || email;
        if (confirmationEmail) {
            await sendEmail(confirmationEmail, 'purchaseRequestConfirmation', {
                request: requestData
            });
        }

        res.status(201).json({ message: 'Purchase Request created and sent successfully', id: docRef.id });

    } catch (error) {
        console.error('Error creating purchase request:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPurchaseRequests = async (req, res) => {
    try {
        const { status, store, employee, startDate, endDate } = req.query;
        let query = db.collection(COLLECTION_NAME);

        if (status) query = query.where('status', '==', status);


        const snapshot = await query.get();
        let requests = [];

        snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() });
        });

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

        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPurchaseRequestById = async (req, res) => {
    try {
        const doc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Request not found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleResponse = async (req, res) => {
    try {
        const { token } = req.params;
        const { action } = req.query;

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
            case 'confirm': newStatus = 'Confirmed'; break;
            case 'approve': newStatus = 'Approved'; break;
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

exports.getRequestByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const snapshot = await db.collection(COLLECTION_NAME).where('responseToken', '==', token).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        const doc = snapshot.docs[0];
        const request = doc.data();

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
            tokenUsed: request.tokenUsed,
            publicEmail: request.publicEmail
        };

        res.json(publicInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, updatedAt: new Date().toISOString() };

        // Remove fields that shouldn't be updated manually if necessary
        delete updates.id;
        delete updates.createdAt;

        await db.collection(COLLECTION_NAME).doc(id).update(updates);
        res.json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating purchase request:', error);
        res.status(500).json({ error: error.message });
    }
};

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
