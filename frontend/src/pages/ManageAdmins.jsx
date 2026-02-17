import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ManageAdmins = () => {
    const { user } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/staff`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setStaff(data);
            } else {
                throw new Error(data.error || 'Failed to fetch staff');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (uid, currentRole, name) => {
        const newRole = currentRole === 'admin' ? 'staff' : 'admin';
        if (!window.confirm(`Are you sure you want to change ${name}'s role to ${newRole}?`)) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                setStaff(staff.map(u => u.id === uid ? { ...u, role: newRole } : u));
                alert(`Role updated successfully.`);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update role');
            }
        } catch (err) {
            alert('Error updating role');
        }
    };

    const handleDeleteUser = async (uid, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setStaff(staff.filter(u => u.id !== uid));
                alert('User deleted successfully');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (err) {
            alert('Error deleting user');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in py-6 px-[10px] sm:px-6 lg:px-8 relative z-10">
            <header className="text-center sm:text-left">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">Manage Admins</h1>
                <p className="text-gray-600 text-lg font-medium">Control system access and user roles</p>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg animate-slide-in">
                    <p className="text-red-700 font-bold uppercase tracking-tight">{error}</p>
                </div>
            )}

            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Last Access</th>
                                <th className="px-8 py-6 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col justify-center items-center space-y-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Loading Users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : staff.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                staff.map(member => (
                                    <tr key={member.id} className="hover:bg-red-50/20 transition-all duration-200 group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-md mr-4 group-hover:scale-110 transition-transform">
                                                    {member.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{member.name || 'No Name Set'}</div>
                                                    <div className="text-xs font-medium text-gray-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${member.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                {member.role || 'GUEST'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-500">
                                            {member.lastLogin
                                                ? new Date(member.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                                                : 'Never Accessed'
                                            }
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => handleRoleChange(member.id, member.role, member.name || member.email)}
                                                    disabled={member.email === user.email}
                                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${member.role === 'admin'
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                                >
                                                    {member.role === 'admin' ? 'Demote' : 'Promote'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(member.id, member.name || member.email)}
                                                    disabled={member.email === user.email}
                                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Authenticated Admins: {staff.filter(s => s.role === 'admin').length}
                        </span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Active</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAdmins;
