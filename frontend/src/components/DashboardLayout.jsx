import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const DashboardLayout = () => {
    const { user, role, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'New Request', path: '/dashboard/create-request' },
        { name: 'View Responses', path: '/dashboard/responses' },
    ];

    if (user && role === 'admin') {
        navLinks.push({ name: 'Manage Admins', path: '/dashboard/admins' });
    }

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="glass-nav sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
                    <Link to="/dashboard" className="flex items-center group" onClick={closeMenu}>
                        <div className="transform group-hover:scale-105 transition-transform duration-300">
                            <img src="/assets/logo.png" alt="Huntsman Optics" className="h-10 w-auto" />
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${location.pathname === link.path
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-gray-100 transition-colors duration-300 border border-transparent hover:border-gray-200"
                            >
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{user?.email?.split('@')[0]}</span>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-fade-in overflow-hidden">
                                    <div className="px-5 py-3 border-b border-gray-50 mb-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                                        <p className="text-sm font-bold text-gray-900 truncate mt-1">{user?.email}</p>
                                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                                            {role}
                                        </div>
                                    </div>
                                    <Link
                                        to="/dashboard/profile"
                                        className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors duration-300 flex items-center space-x-3"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Profile Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors duration-300 flex items-center space-x-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Log out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                            title="Log out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100 py-4' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-2 px-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-4 py-3 rounded-2xl text-base font-bold transition-all duration-300 ${location.pathname === link.path
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                                    }`}
                                onClick={closeMenu}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <div className="px-4 py-3 bg-red-50 rounded-2xl flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-tight">Signed in as</p>
                                    <p className="text-sm font-bold text-red-800 truncate">{user?.email}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            </div>
                            <Link
                                to="/dashboard/profile"
                                className="block w-full py-4 text-center text-base font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-2xl mb-2 transition-all duration-300"
                                onClick={closeMenu}
                            >
                                Profile Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 text-center text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-300"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow px-[10px] py-4 sm:p-6 lg:p-8 animate-fade-in relative z-10">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <footer className="py-6 text-center z-10">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/50 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-white/20">
                    © 2026 Huntsman Optics Staff Purchase System
                </p>
            </footer>
        </div>
    );
};

export default DashboardLayout;
