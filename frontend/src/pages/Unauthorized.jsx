import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
                <div className="bg-white/95 backdrop-blur-md py-10 px-8 shadow-2xl rounded-3xl border border-gray-100 text-center hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6 ring-4 ring-red-50">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Access Pending</h2>
                    <p className="text-gray-600 mb-8 font-medium">
                        Your account has been created but requires administrator approval to access the system.
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Logged in as</p>
                        <p className="text-sm font-bold text-gray-800">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 px-6 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
