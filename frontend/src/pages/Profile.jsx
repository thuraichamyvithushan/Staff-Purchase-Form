import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';


const Profile = () => {
    const { user, role, updateUserDetails, updateUserPassword } = useAuth();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [profileMessage, setProfileMessage] = useState('');
    const [isProfileError, setIsProfileError] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage('');
        setIsProfileError(false);
        try {
            await updateUserDetails(displayName);
            setProfileMessage('Your profile has been updated successfully.');
            setIsProfileError(false);
        } catch (err) {
            setProfileMessage('Failed to update profile. Please try again.');
            setIsProfileError(true);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage('Passwords do not match');
            setIsPasswordError(true);
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters');
            setIsPasswordError(true);
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage('');
        setIsPasswordError(false);
        try {
            await updateUserPassword(newPassword);
            setPasswordMessage('Password changed successfully.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage(err.message || 'Failed to change password. You may need to re-login.');
            setIsPasswordError(true);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center sm:flex-row sm:space-x-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 sm:mb-0">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900">{user?.displayName || 'Admin'}</h1>
                    <p className="text-red-600 font-bold text-sm tracking-wider uppercase bg-red-50 px-3 py-1 rounded-full inline-block mt-2">
                        {role} Account
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full border-b-2 border-gray-100 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="w-full border-b-2 border-gray-50 py-2 bg-transparent text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Email cannot be changed</p>
                        </div>

                        <button
                            type="submit"
                            disabled={profileLoading}
                            className={`w-full py-3 px-6 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${profileLoading ? 'opacity-70' : ''}`}
                            style={{ background: 'linear-gradient(135deg, #111827 0%, #374151 100%)' }}
                        >
                            {profileLoading ? 'Updating...' : 'Update Profile'}
                        </button>

                        {profileMessage && (
                            <div className={`p-4 rounded-xl text-sm font-bold animate-slide-in ${isProfileError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {profileMessage}
                            </div>
                        )}
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                        <h2 className="text-xl font-bold text-gray-900">Security</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full border-b-2 border-gray-100 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full border-b-2 border-gray-100 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className={`w-full py-3 px-6 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${passwordLoading ? 'opacity-70' : ''}`}
                            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                        >
                            {passwordLoading ? 'Updating Password...' : 'Change Password'}
                        </button>

                        {passwordMessage && (
                            <div className={`p-4 rounded-xl text-sm font-bold animate-slide-in ${isPasswordError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {passwordMessage}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
