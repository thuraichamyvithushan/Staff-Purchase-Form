import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword
} from 'firebase/auth';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setSyncing(true);
                try {
                    // Force refresh token to ensure we get the latest claims (like displayName)
                    const token = await firebaseUser.getIdToken(true);
                    const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setRole(data.role);
                        setUser(firebaseUser);
                    } else {
                        setUser(firebaseUser);
                        setRole('staff');
                    }
                } catch (err) {
                    setUser(firebaseUser);
                    setRole('staff');
                } finally {
                    setSyncing(false);
                }
            } else {
                setUser(null);
                setRole(null);
                setSyncing(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);
    const resetPassword = (email) => sendPasswordResetEmail(auth, email);
    const updateUserDetails = (displayName) => updateProfile(auth.currentUser, { displayName });
    const updateUserPassword = (newPassword) => updatePassword(auth.currentUser, newPassword);

    // Registration function
    const createNewUser = async (email, password, name) => {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        return userCredential;
    };

    const value = {
        user,
        role,
        login,
        logout,
        resetPassword,
        updateUserDetails,
        updateUserPassword,
        createNewUser, // Added
        loading,
        syncing
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#64748b', fontWeight: '600', letterSpacing: '0.05em' }}>Loading....</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
