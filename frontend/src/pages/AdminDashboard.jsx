import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        rejected: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/purchase-requests`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    const pending = data.filter(r => r.status === 'Pending').length;
                    const confirmed = data.filter(r => r.status === 'Confirmed').length;
                    const rejected = data.filter(r => r.status === 'Rejected').length;
                    setStats({ pending, confirmed, rejected });
                }
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };
        fetchStats();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
            <header className="text-center sm:text-left">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 text-lg font-medium">Staff Purchase Request System - Australia</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div
                    onClick={() => navigate('/dashboard/create-request')}
                    className="bg-white/95 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center text-center group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                    <div className="p-5 rounded-3xl mb-6 shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Create & Send New Purchase Form</h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm">Generate a new purchase request and send it for approval.</p>
                </div>

                <div
                    onClick={() => navigate('/dashboard/responses')}
                    className="bg-white/95 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center text-center group relative overflow-hidden"
                >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full -ml-16 -mb-16 transition-transform duration-500 group-hover:scale-150"></div>
                    <div className="p-5 rounded-3xl mb-6 shadow-xl transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">View Responses</h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm">Track status, view history, and manage submitted requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div
                    onClick={() => navigate('/dashboard/responses?status=Pending')}
                    className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col items-center justify-center border-b-4 border-b-transparent hover:border-b-yellow-400"
                >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Pending</div>
                    <div className="text-5xl font-black text-yellow-500">{stats.pending}</div>
                </div>
                <div
                    onClick={() => navigate('/dashboard/responses?status=Confirmed')}
                    className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col items-center justify-center border-b-4 border-b-green-500 hover:border-b-green-600"
                >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Confirmed</div>
                    <div className="text-5xl font-black text-green-600">{stats.confirmed}</div>
                </div>
                <div
                    onClick={() => navigate('/dashboard/responses?status=Rejected')}
                    className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col items-center justify-center border-b-4 border-b-red-500 hover:border-b-red-600"
                >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Rejected</div>
                    <div className="text-5xl font-black text-red-600">{stats.rejected}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
