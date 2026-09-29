import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const formatDate = value => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString(undefined, {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const displayValue = value => value === null || value === undefined || value === '' ? '-' : value;

const Field = ({ label, value }) => (
    <div className="min-w-0">
        <dt className="text-xs font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-900">{displayValue(value)}</dd>
    </div>
);

const ViewIcon = () => (
    <svg className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
    </svg>
);

const RestoreIcon = () => (
    <svg className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 11a8 8 0 1 1 2.5 6M4 5v6h6" />
    </svg>
);

const DeleteIcon = () => (
    <svg className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v6m4-6v6" />
    </svg>
);

const RecycleBin = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        const loadItems = async () => {
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${API_BASE_URL}/api/admin/recycle-bin`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || data.message || 'Failed to load Recycle Bin');
                if (!cancelled) setItems(data.requests || []);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadItems();
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        if (!selectedItem && !itemToDelete) return;
        const onKeyDown = event => {
            if (event.key !== 'Escape' || busyId) return;
            if (itemToDelete) setItemToDelete(null);
            else setSelectedItem(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedItem, itemToDelete, busyId]);

    const changeItem = async (item, action) => {
        const permanently = action === 'delete';
        setBusyId(item.id);
        setError('');
        try {
            const token = await user.getIdToken();
            const response = await fetch(
                `${API_BASE_URL}/api/admin/recycle-bin/${item.id}${permanently ? '' : '/restore'}`,
                {
                    method: permanently ? 'DELETE' : 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message || 'Action failed');
            setItems(current => current.filter(entry => entry.id !== item.id));
            setSelectedItem(null);
            setItemToDelete(null);
        } catch (err) {
            setError(err.message);
            setItemToDelete(null);
        } finally {
            setBusyId(null);
        }
    };

    const searchText = search.trim().toLowerCase();
    const filteredItems = items.filter(item => !searchText || [
        item.request?.employeeName,
        item.request?.storeName,
        item.request?.publicEmail,
        item.request?.email
    ].some(value => String(value || '').toLowerCase().includes(searchText)));

    const actions = item => (
        <div className="flex flex-nowrap gap-2 sm:flex-wrap">
            <button
                type="button"
                aria-label="View request"
                title="View request"
                onClick={() => setSelectedItem(item)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 sm:h-10 sm:w-auto sm:px-3"
            >
                <span className="sm:hidden"><ViewIcon /></span>
                <span className="hidden sm:inline">View</span>
            </button>
            <button
                type="button"
                aria-label={busyId === item.id ? 'Restoring request' : 'Restore request'}
                title="Restore request"
                disabled={busyId === item.id}
                onClick={() => changeItem(item, 'restore')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-emerald-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50 sm:h-10 sm:w-auto sm:px-3"
            >
                <span className="sm:hidden"><RestoreIcon /></span>
                <span className="hidden sm:inline">{busyId === item.id ? 'Working...' : 'Restore'}</span>
            </button>
            <button
                type="button"
                aria-label="Permanently delete request"
                title="Permanently delete request"
                disabled={busyId === item.id}
                onClick={() => setItemToDelete(item)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-red-600 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 sm:h-10 sm:w-auto sm:px-3"
            >
                <span className="sm:hidden"><DeleteIcon /></span>
                <span className="hidden sm:inline">Permanent delete</span>
            </button>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl space-y-5 py-3 sm:py-6">
            <header className="rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-7">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recycle Bin</h1>
                <p className="mt-2 text-sm leading-6 text-gray-600">Review deleted requests and responses, then restore or permanently delete them.</p>
            </header>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

            <section aria-label="Deleted requests" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">Deleted records</h2>
                        <p className="shrink-0 text-sm text-gray-600"><span className="font-bold text-gray-900">{loading ? '—' : items.length}</span> deleted requests</p>
                    </div>
                    <div className="mt-6 w-full sm:ml-auto sm:max-w-sm">
                        <div className="flex h-16 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition-colors hover:border-gray-300 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100">
                            <svg className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="10.5" cy="10.5" r="6.5" />
                                <path strokeLinecap="round" d="m15.5 15.5 5 5" />
                            </svg>
                            <input
                                id="recycle-search"
                                type="text"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Employee, store or email"
                                aria-label="Search by employee, store, contact email or Sight App email"
                                className="h-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900">
                                    <svg className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" d="M5 5 19 19M19 5 5 19" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {!loading && filteredItems.length > 0 && <p className="px-5 pt-3 text-xs text-gray-500 lg:hidden">Scroll sideways to see the full table.</p>}

                {loading ? (
                    <p role="status" className="py-12 text-center text-sm text-gray-500">Loading deleted requests...</p>
                ) : error && items.length === 0 ? (
                    <p className="px-5 py-12 text-center text-sm text-gray-500">Could not load deleted requests. Refresh the page to try again.</p>
                ) : filteredItems.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="font-medium text-gray-900">{items.length ? 'No matching records' : 'Recycle Bin is empty'}</p>
                        {items.length > 0 && <button type="button" onClick={() => setSearch('')} className="mt-2 text-sm font-medium text-red-700 hover:underline">Clear search</button>}
                    </div>
                ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] table-fixed text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                                    <tr>
                                        <th className="w-[25%] px-5 py-4">Request</th>
                                        <th className="w-[10%] px-3 py-4">Status</th>
                                        <th className="w-[18%] px-3 py-4">Deleted by</th>
                                        <th className="w-[17%] px-3 py-4">Deleted on</th>
                                        <th className="w-[30%] px-3 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="align-top hover:bg-gray-50/60">
                                            <td className="px-5 py-5">
                                                <p className="break-words font-semibold text-gray-900">{displayValue(item.request?.employeeName)}</p>
                                                <p className="mt-1 break-words text-gray-600">{displayValue(item.request?.storeName)} · {displayValue(item.request?.productModel)}</p>
                                            </td>
                                            <td className="px-3 py-5"><span className="inline-block break-words rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{displayValue(item.request?.status)}</span></td>
                                            <td className="px-3 py-5">
                                                <p className="break-words text-gray-900">{displayValue(item.deletedBy?.name || item.deletedBy?.email)}</p>
                                                {item.deletedBy?.email && <p className="mt-1 break-words text-gray-600">{item.deletedBy.email}</p>}
                                            </td>
                                            <td className="px-3 py-5 text-gray-700">{formatDate(item.deletedAt)}</td>
                                            <td className="px-3 py-4">{actions(item)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                )}
            </section>

            {selectedItem && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setSelectedItem(null)}>
                    <div role="dialog" aria-modal="true" aria-label="Request details" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-h-[85dvh] sm:max-w-2xl sm:rounded-2xl" onClick={event => event.stopPropagation()}>
                        <div className="sticky top-0 flex justify-end border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
                            <button type="button" aria-label="Close view" onClick={() => setSelectedItem(null)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
                        </div>
                        <div className="space-y-6 px-5 py-5 sm:px-6">
                            <section>
                                <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">Request</h3>
                                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                    <Field label="Store" value={selectedItem.request?.storeName} />
                                    <Field label="Employee" value={selectedItem.request?.employeeName} />
                                    <Field label="Product" value={selectedItem.request?.productModel} />
                                    <Field label="Serial number" value={selectedItem.request?.serialNumber} />
                                    <Field label="Contact email" value={selectedItem.request?.publicEmail} />
                                    <Field label="Sight App email" value={selectedItem.request?.email} />
                                    <Field label="FOB" value={selectedItem.request?.fob} />
                                    <Field label="Discount" value={selectedItem.request?.discount} />
                                    <Field label="Rebate" value={selectedItem.request?.rebate} />
                                    <Field label="Order date" value={formatDate(selectedItem.request?.orderDate)} />
                                    <Field label="Invoice date" value={formatDate(selectedItem.request?.invoiceDate)} />
                                    <Field label="Created on" value={formatDate(selectedItem.request?.createdAt)} />
                                </dl>
                            </section>
                            <section>
                                <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">Response</h3>
                                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                    <Field label="Status" value={selectedItem.request?.status} />
                                    <Field label="Decision" value={selectedItem.request?.responseType} />
                                    <Field label="Responded on" value={formatDate(selectedItem.request?.responseTimestamp)} />
                                    <div className="sm:col-span-2"><Field label="Response note" value={selectedItem.request?.responseNote} /></div>
                                </dl>
                            </section>
                            <section>
                                <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">Deletion</h3>
                                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                    <Field label="Deleted by" value={selectedItem.deletedBy?.name} />
                                    <Field label="Admin email" value={selectedItem.deletedBy?.email} />
                                    <Field label="Deleted on" value={formatDate(selectedItem.deletedAt)} />
                                </dl>
                            </section>
                        </div>
                        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
                            <button type="button" aria-label="Restore request" title="Restore request" disabled={busyId === selectedItem.id} onClick={() => changeItem(selectedItem, 'restore')} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-emerald-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 sm:h-10 sm:w-auto sm:px-4">
                                <span className="sm:hidden"><RestoreIcon /></span>
                                <span className="hidden sm:inline">Restore</span>
                            </button>
                            <button type="button" aria-label="Permanently delete request" title="Permanently delete request" disabled={busyId === selectedItem.id} onClick={() => setItemToDelete(selectedItem)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-red-600 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-50 sm:h-10 sm:w-auto sm:px-4">
                                <span className="sm:hidden"><DeleteIcon /></span>
                                <span className="hidden sm:inline">Permanent delete</span>
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}

            {itemToDelete && createPortal(
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4" onClick={() => !busyId && setItemToDelete(null)}>
                    <div role="alertdialog" aria-modal="true" aria-labelledby="recycle-delete-title" aria-describedby="recycle-delete-description" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={event => event.stopPropagation()}>
                        <h2 id="recycle-delete-title" className="text-xl font-semibold text-gray-900">Delete forever?</h2>
                        <p id="recycle-delete-description" className="mt-3 break-words text-sm leading-6 text-gray-600">
                            The request for <strong>{displayValue(itemToDelete.request?.employeeName)}</strong> and its response will be permanently removed. This cannot be undone.
                        </p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                            <button type="button" disabled={busyId === itemToDelete.id} onClick={() => changeItem(itemToDelete, 'delete')} className="min-h-10 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{busyId === itemToDelete.id ? 'Deleting...' : 'Delete forever'}</button>
                            <button type="button" disabled={busyId === itemToDelete.id} onClick={() => setItemToDelete(null)} className="min-h-10 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};

export default RecycleBin;
