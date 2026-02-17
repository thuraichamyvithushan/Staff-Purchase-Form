import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 sm:p-8 font-['Inter',sans-serif]">
            <div className="mb-12">
                <img src="/assets/logo.png" alt="Huntsman Optics" className="h-16 w-auto" />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100/50 overflow-hidden text-center">
                <div className="p-10 sm:p-20">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <svg className="w-12 h-12 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Account Pending Approval</h1>

                    <div className="space-y-4 mb-10">
                        <p className="text-gray-500 font-medium text-lg leading-relaxed">
                            Hello <span className="text-red-600 font-bold">{user?.displayName || user?.email}</span>, your registration has been received.
                        </p>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            For security purposes, an administrator must manually verify your credentials before you can access the dashboard.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-10 inline-flex items-center space-x-3 border border-gray-100">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Awaiting Verification</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl"
                    >
                        Sign Out
                    </button>

                    <p className="mt-8 text-xs text-gray-300 font-medium">
                        Need urgent access? Contact Regional Support.
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                © 2026 Huntsman Optics Secure Portal • STAFF ACCESS
            </div>
        </div>
    );
};

export default PendingApproval;
