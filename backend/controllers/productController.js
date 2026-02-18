const { db } = require('../config/firebase');

const COLLECTION_NAME = 'products';

exports.getProducts = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).orderBy('name').get();
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        const snapshot = await db.collection(COLLECTION_NAME).where('name', '==', name).limit(1).get();
        if (!snapshot.empty) {
            return res.status(400).json({ error: 'Product already exists' });
        }

        const newProduct = {
            name,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection(COLLECTION_NAME).add(newProduct);
        res.status(201).json({ id: docRef.id, ...newProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await docRef.delete();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
