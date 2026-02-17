import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ManageProducts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            const data = await response.json();
            if (response.ok) {
                setProducts(data);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.trim()) return;

        setError('');
        setSuccess('');

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newProduct.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add product');
            }

            setSuccess('Product added successfully');
            setNewProduct('');
            fetchProducts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        setError('');
        setSuccess('');

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete product');
            }

            setSuccess('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Manage Products</h1>
                    <p className="text-gray-500 mt-2">Add or remove product models available in the form.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                    Back to Dashboard
                </button>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}
            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <p className="text-green-700 font-medium">{success}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleAddProduct} className="flex gap-4">
                    <input
                        type="text"
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                        placeholder="Enter new product model name"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newProduct.trim()}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-500/30"
                    >
                        Add Model
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-gray-700">Current Product List ({products.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading products...</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {products.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 italic">No products found. Add one above.</div>
                        ) : (
                            products.map(product => (
                                <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                        title="Delete product"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageProducts;
