import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const ResponseConfirmation = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const action = searchParams.get('action');

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [requestData, setRequestData] = useState(null);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitResponse = async (finalNote = '') => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/respond/${token}?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: finalNote || note })
            });

            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setMessage(action === 'confirm' ? 'Your confirmation has been recorded. Thank you!' : 'Your response has been recorded.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to record response.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!token || !action) {
            setStatus('error');
            setMessage('Invalid response link.');
            setLoading(false);
            return;
        }

        const fetchRequestDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/public/request/${token}`);
                const data = await response.json();
                if (response.ok) {
                    setRequestData(data);
                    if (data.tokenUsed) {
                        setStatus('error');
                        setMessage('This response link has already been used.');
                    }
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to load request details.');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setStatus('error');
                setMessage('Error loading request details.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequestDetails();

        if (action !== 'confirm' && action !== 'reject' && action !== 'needinfo') {
            submitResponse();
        }
    }, [token, action]);

    const handleConfirm = () => {
        if (action === 'confirm' && !termsAgreed) return;
        submitResponse();
    };

    const renderDetailRow = (label, value, isHighlighted = false) => (
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between py-4 border-b border-gray-50 last:border-0 group">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-0">{label}</span>
            <span className={`text-sm font-bold ${isHighlighted ? 'text-red-700' : 'text-gray-900'} sm:text-right sm:ml-8 leading-relaxed line-clamp-2`}>
                {value || '---'}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-[10px] py-4 sm:p-8 font-['Inter',sans-serif]">
            <div className="mb-12 animate-fade-in">
                <img src="/assets/logo.png" alt="Huntsman Optics" className="h-16 w-auto grayscale-0 hover:grayscale-0 transition-all duration-700" />
            </div>

            <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100/50 overflow-hidden relative">
                <div className="p-10 sm:p-20">
                    {loading ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Fetching Request...</p>
                        </div>
                    ) : status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-6 shadow-lg shadow-green-100">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Response Recorded</h2>
                            <p className="text-gray-500 font-medium text-lg mb-4">{message}</p>
                            <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Status:</span>
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                                    {action === 'needinfo' ? 'Update Required' : action.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ) : status === 'error' ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-lg shadow-red-100">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Oops!</h2>
                            <p className="text-red-600 font-bold text-lg mb-2">{message}</p>
                            <p className="text-gray-500 text-sm">Please contact support if you believe this is an error.</p>
                        </div>
                    ) : requestData ? (
                        <div className="space-y-12">
                            <div className="flex items-center space-x-5 animate-slide-in">
                                <div className={`p-4 rounded-3xl ${action === 'confirm' ? 'bg-green-50 text-green-600 shadow-[0_8px_30px_rgb(22,163,74,0.1)]' : 'bg-red-50 text-red-600 shadow-[0_8px_30px_rgb(220,38,38,0.1)]'}`}>
                                    {action === 'confirm' ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                        {action === 'confirm' ? 'Final Confirmation' : action === 'reject' ? 'Reject Request' : 'Update Request'}
                                    </h1>
                                    <p className="text-gray-500 font-medium text-sm mt-1">
                                        {action === 'confirm' ? 'Review your details and accept the terms below.' : 'Please let us know the reason for this update.'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 sm:p-12 border border-gray-100">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Request Details</h2>
                                </div>
                                <div className="space-y-1">
                                    {renderDetailRow('Store Name', requestData.storeName)}
                                    {renderDetailRow('Employee Name', requestData.employeeName)}
                                    {renderDetailRow('Product Model', requestData.productModel, true)}
                                    {renderDetailRow('Discount Applied', requestData.discount)}
                                    {requestData.serialNumber && renderDetailRow('Serial Number', requestData.serialNumber)}
                                    {requestData.fob && renderDetailRow('FOB', requestData.fob)}
                                    {requestData.rebate && renderDetailRow('Rebate', requestData.rebate)}
                                    {renderDetailRow('Order Date', new Date(requestData.orderDate).toLocaleDateString('en-AU'))}
                                    {renderDetailRow('Invoice Date', new Date(requestData.invoiceDate).toLocaleDateString('en-AU'))}
                                </div>
                            </div>

                            <div className="space-y-10">
                                {action === 'confirm' ? (
                                    <div className="bg-red-50/50 rounded-[2rem] p-8 sm:p-10 border border-red-100/50">
                                        <h4 className="text-red-900 font-black text-sm uppercase tracking-widest mb-6 border-b border-red-100 pb-4">Terms & Conditions</h4>
                                        <div className="space-y-5">
                                            <label className="flex items-start space-x-4 group cursor-pointer">
                                                <div className="relative flex items-center mt-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={termsAgreed}
                                                        onChange={(e) => setTermsAgreed(e.target.checked)}
                                                        className="peer h-6 w-6 border-2 border-red-200 rounded-lg bg-white checked:bg-red-600 checked:border-red-600 transition-all duration-300 appearance-none cursor-pointer"
                                                    />
                                                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none top-1 left-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-red-800 text-sm font-bold leading-relaxed group-hover:text-red-900 transition-colors">
                                                    I agree to register for the Sight App and acknowledge the 14-month possession rule.
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">What is incorrect? (Optional)</label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Example: The FOB price is incorrect, or the serial number has a typo..."
                                            className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-3xl p-6 text-sm font-bold text-gray-900 placeholder-gray-300 focus:border-red-600 focus:bg-white outline-none transition-all duration-300 h-32 resize-none"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    disabled={isSubmitting || (action === 'confirm' && !termsAgreed)}
                                    className={`w-full py-6 px-10 rounded-3xl text-white font-black text-lg transition-all duration-300 transform shadow-xl flex items-center justify-center space-x-3
                                        bg-red-600 hover:bg-black hover:shadow-2xl active:scale-95
                                        ${(isSubmitting || (action === 'confirm' && !termsAgreed))
                                            ? 'cursor-not-allowed'
                                            : ''
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>{action === 'confirm' ? 'Confirm & Accept Request' : 'Submit Feedback'}</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                © 2026 Huntsman Optics Secure Portal • Staff Access
            </div>
        </div>
    );
};

export default ResponseConfirmation;
