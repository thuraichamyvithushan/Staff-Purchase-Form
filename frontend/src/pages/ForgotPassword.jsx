import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ForgotPassword = () => {
    const { user, resetPassword } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await resetPassword(email);
            setMessage('Instructions sent! Please check your email inbox.');
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-[10px] sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-gray-500">Enter your email for reset instructions</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="group">
                            <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                disabled={!!user}
                                className="w-full border-b-2 border-gray-200 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400"
                                placeholder="admin@huntsmanoptics.com.au"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-200 animate-slide-in">
                                <p className="text-sm font-bold text-red-800">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="rounded-xl bg-green-50 p-4 border border-green-200 animate-slide-in">
                                <p className="text-sm font-bold text-green-800">{message}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-6 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Sending...' : 'Send Reset Email'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        {user ? (
                            <button
                                type="button"
                                className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </button>
                        ) : (
                            <Link to="/login" className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
                                Back to Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
