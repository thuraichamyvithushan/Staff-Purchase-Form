import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login component error:", err);
            setError(err.message.includes('auth/invalid-credential') ? 'Invalid email or password' : err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-[10px] sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fade-in">


                <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-500">Please enter your admin credentials</p>
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
                                className="w-full border-b-2 border-gray-200 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400"
                                placeholder="admin@huntsmanoptics.com.au"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="group">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full border-b-2 border-gray-200 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-200 animate-slide-in">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold text-red-800">Login failed</h3>
                                        <div className="mt-1 text-sm text-red-700 font-medium">{error}</div>
                                    </div>
                                </div>
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
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                    <div className="flex flex-col space-y-4 mt-6">
                        <Link to="/forgot-password" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors text-center">
                            Forgot your password?
                        </Link>
                        <Link to="/register" className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors text-center">
                            Don't have an account? Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
