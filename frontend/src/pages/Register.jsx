import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { createNewUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setError('');
        setLoading(true);

        try {
            await createNewUser(email, password, name);
            navigate('/dashboard');
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-[10px] sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">


                <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Join Us</h2>
                        <p className="mt-2 text-sm text-gray-500">Create your admin account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl animate-shake">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-bold text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full border-b-2 border-gray-300 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full border-b-2 border-gray-300 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent"
                                placeholder="admin@huntsmanoptics.com.au"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full border-b-2 border-gray-300 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="google-label">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full border-b-2 border-gray-300 focus:border-red-600 focus:outline-none py-3 transition-all duration-300 bg-transparent"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-6 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Creating Account...' : 'Register'}
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm font-bold text-red-600 hover:text-red-800">
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
