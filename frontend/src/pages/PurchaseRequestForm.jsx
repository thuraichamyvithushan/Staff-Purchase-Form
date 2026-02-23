import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';



const PurchaseRequestForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products`);
                const data = await response.json();
                if (response.ok) {
                    setProducts(data.map(p => p.name));
                }
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();

        // Auto-fill for logged in admins
        if (user) {
            setFormData(prev => ({
                ...prev,
                publicEmail: user.email || '',
                employeeName: user.displayName || user.name || ''
            }));
        }
    }, [user]);

    const [formData, setFormData] = useState({
        storeName: '',
        employeeName: '',
        orderDate: new Date().toISOString().split('T')[0],
        invoiceDate: new Date().toISOString().split('T')[0],
        productModel: '',
        serialNumber: '',
        fob: '',
        discount: '',
        rebate: '',
        email: '',
        publicEmail: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (product) => {
        setFormData(prev => ({ ...prev, productModel: product }));
        setSearchTerm(product);
        setShowDropdown(false);
    };

    const filteredProducts = products.filter(p =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const isPublic = !user;
            const endpoint = isPublic
                ? `${API_BASE_URL}/api/public/purchase-requests`
                : `${API_BASE_URL}/api/admin/purchase-requests`;

            const headers = { 'Content-Type': 'application/json' };
            if (!isPublic) {
                const token = await user.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setSuccess('Purchase request sent successfully!');
            setFormData({
                storeName: '',
                employeeName: '',
                orderDate: new Date().toISOString().split('T')[0],
                invoiceDate: new Date().toISOString().split('T')[0],
                productModel: '',
                serialNumber: '',
                fob: '',
                discount: '',
                rebate: '',
                email: '',
                publicEmail: ''
            });
            setSearchTerm('');

            window.scrollTo(0, 0);

        } catch (err) {
            setError(err.message);
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-8 px-[10px] sm:px-6 lg:px-8 font-sans relative z-10">
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 relative">
                    <div className="h-2.5 w-full bg-gradient-to-r from-red-600 to-red-800"></div>

                    <img src="/assets/baner.jpg" alt="Header" className="w-full h-48 object-cover object-center" />

                    <div className="p-6 sm:p-10">
                        <h1 className="text-3xl sm:text-4xl font-normal text-gray-900 mb-4">Huntsman Optics Staff Purchase Request</h1>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Please fill out this form to submit your staff purchase request. All fields marked with an asterisk are required.
                        </p>
                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">{user ? user.email : 'Public Submission'}</span>
                            <span className="text-xs text-red-600">* Required</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-8 border-red-600 animate-slide-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-8 border-green-600 animate-slide-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-2">
                            Enter Your Email <span className="text-red-600">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-6 italic">Please provide your contact email (Person filling this form)</p>
                        <input
                            type="email"
                            name="publicEmail"
                            required
                            value={formData.publicEmail}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your contact email"
                        />
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Store Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            required
                            value={formData.storeName}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Employee Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="employeeName"
                            required
                            value={formData.employeeName}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Order Date <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            name="orderDate"
                            required
                            value={formData.orderDate}
                            onChange={handleChange}
                            className="w-full sm:w-1/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 group-focus-within:border-red-600"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Invoice Date <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            name="invoiceDate"
                            required
                            value={formData.invoiceDate}
                            onChange={handleChange}
                            className="w-full sm:w-1/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 group-focus-within:border-red-600"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow relative">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Product Model <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                    setFormData(prev => ({ ...prev, productModel: '' }));
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                                placeholder="Select or search product"
                            />
                            {showDropdown && (
                                <div className="absolute z-20 w-full sm:w-2/3 bg-white shadow-xl max-h-60 overflow-y-auto border border-gray-100 rounded-lg mt-1 animate-fade-in">
                                    {filteredProducts.map((product, idx) => (
                                        <div
                                            key={idx}
                                            className="px-6 py-3 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors font-medium border-b border-gray-50 last:border-0"
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            {product}
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="px-6 py-4 text-gray-500 italic">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            required
                            value={formData.productModel}
                            onChange={() => { }}
                            className="sr-only"
                            tabIndex={-1}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Serial Number
                        </label>
                        <input
                            type="text"
                            name="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>



                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Discount <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="discount"
                            required
                            value={formData.discount}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>





                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Email (Sight APP Registration) <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    <div className="flex items-center justify-between py-6">
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-10 py-3 text-white font-bold rounded-xl shadow-md transition-all duration-300 transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                            >
                                {loading ? 'Sending...' : 'Submit'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        storeName: '',
                                        employeeName: '',
                                        orderDate: new Date().toISOString().split('T')[0],
                                        invoiceDate: new Date().toISOString().split('T')[0],
                                        productModel: '',
                                        serialNumber: '',
                                        fob: '',
                                        discount: '',
                                        rebate: '',
                                        email: '',
                                        publicEmail: ''
                                    });
                                    setSearchTerm('');
                                    window.scrollTo(0, 0);
                                }}
                                className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Clear form
                            </button>
                        </div>

                        <div className="hidden sm:block text-[10px] text-gray-400 uppercase tracking-widest font-black">
                            Huntsman Optics Secure Form
                        </div>
                    </div>
                </form>


            </div>
        </div>
    );
};

export default PurchaseRequestForm;
