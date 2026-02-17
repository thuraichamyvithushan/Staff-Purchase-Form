
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { auth: firebaseAuth, db } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const authController = require('./controllers/authController');
const purchaseController = require('./controllers/purchaseController');
const { initCron } = require('./services/cronService');

app.get('/', (req, res) => {
    res.json({
        message: "Staff Purchase Form Backend API is running.",
        version: "1.0.0",
        status: "healthy"
    });
});

app.get('/api/respond/:token', purchaseController.handleResponse);
app.post('/api/respond/:token', purchaseController.handleResponse);
app.get('/api/public/request/:token', purchaseController.getRequestByToken);
// Admin (Protected)
app.post('/api/public/purchase-requests', purchaseController.createPurchaseRequest);
app.post('/api/admin/purchase-requests', authController.protect, authController.adminOnly, purchaseController.createPurchaseRequest);
app.get('/api/admin/purchase-requests', authController.protect, authController.adminOnly, purchaseController.getPurchaseRequests);
app.get('/api/admin/purchase-requests/:id', authController.protect, authController.adminOnly, purchaseController.getPurchaseRequestById);
app.post('/api/admin/test-reminder', authController.protect, authController.adminOnly, purchaseController.testReminder);
app.delete('/api/admin/purchase-requests/:id', authController.protect, authController.adminOnly, purchaseController.deletePurchaseRequest);

app.post('/api/auth/sync', authController.protect, authController.syncUser);

// Export/Import/Bulk
// app.delete('/api/admin/bookings/all', authController.protect, authController.adminOnly, bookingController.deleteAllBookings);
// app.get('/api/admin/bookings/export', authController.protect, authController.adminOnly, bookingController.exportBookings);
// app.post('/api/admin/bookings/import', authController.protect, authController.adminOnly, upload.single('file'), bookingController.importBookings);

/*
app.post('/api/admin/check-overdues', authController.protect, authController.adminOnly, async (req, res) => {
    try {
        await checkOverdues();
        res.json({ message: "Overdue check triggered successfully. Check your email for the report." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
*/
// app.put('/api/admin/bookings/:id/status', authController.protect, authController.adminOnly, bookingController.updateBookingStatus);
// app.put('/api/admin/bookings/:id/archive', authController.protect, authController.adminOnly, bookingController.archiveBooking);
// app.put('/api/admin/bookings/:id', authController.protect, authController.adminOnly, bookingController.updateBooking);
// app.delete('/api/admin/bookings/:id', authController.protect, authController.adminOnly, bookingController.deleteBooking);
app.get('/api/admin/staff', authController.protect, authController.adminOrRepresentative, authController.getStaff);
app.put('/api/admin/users/:uid/role', authController.protect, authController.adminOnly, authController.updateUserRole);
app.delete('/api/admin/users/:uid', authController.protect, authController.adminOnly, authController.deleteUser);

initCron();

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found on this server.` });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
