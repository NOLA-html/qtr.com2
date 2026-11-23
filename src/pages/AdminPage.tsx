import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Star,
  Wrench,
  Zap,
  Cpu,
  Mail,
  AlertCircle,
  ShoppingCart,
  Truck,
  Boxes,
  Eye,
  ExternalLink,
  Tag
} from 'lucide-react';
import { BUILDER_PARTS, BuilderPart, getPartCentreComUrl } from '../data/builderCatalog.ts';
import { formatAud } from '../utils/pricing.ts';
import { CentreComPriceManager } from '../components/CentreComPriceManager.tsx';

export const AdminPage: React.FC = () => {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'priceMatches' | 'customerMotherboards' | 'shipping' | 'reviews' | 'repairs' | 'upgrades' | 'pcQuotes' | 'messages' | 'catalog'>('orders');
  const [adminData, setAdminData] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Customer-supplied motherboard review modal state
  const [selectedMotherboardRecord, setSelectedMotherboardRecord] = useState<any | null>(null);
  const [moboActionStatus, setMoboActionStatus] = useState<'pending' | 'inspection_passed' | 'inspection_failed' | 'approved' | 'rejected'>('inspection_passed');
  const [moboActionNotes, setMoboActionNotes] = useState('');
  const [updatingMoboStatus, setUpdatingMoboStatus] = useState(false);

  // Shipping configuration state
  const [shippingForm, setShippingForm] = useState({
    normalPrice: 25,
    normalTimeframe: '3–5 business days across Australia',
    expressPrice: 55,
    expressTimeframe: '1–2 business days via Express Courier'
  });
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingSaveSuccess, setShippingSaveSuccess] = useState(false);

  // Status edit modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAdminData = async (key: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/admin/data?adminKey=${encodeURIComponent(key)}`, {
        headers: { 'x-admin-key': key }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }
      setAdminData(data.data);
      setMetrics(data.metrics);
      if (data.data.shippingConfig) {
        setShippingForm({
          normalPrice: data.data.shippingConfig.normalPrice,
          normalTimeframe: data.data.shippingConfig.normalTimeframe,
          expressPrice: data.data.shippingConfig.expressPrice,
          expressTimeframe: data.data.shippingConfig.expressTimeframe
        });
      }
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData(passkey);
  };

  // Save shipping configuration
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShipping(true);
    setShippingSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/config/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey
        },
        body: JSON.stringify(shippingForm)
      });
      const data = await res.json();
      if (data.success) {
        setShippingSaveSuccess(true);
        setTimeout(() => setShippingSaveSuccess(false), 3000);
        fetchAdminData(passkey);
      }
    } catch (err) {
      console.error('Failed to update shipping config:', err);
    } finally {
      setSavingShipping(false);
    }
  };

  // Toggle review approval
  const toggleReviewApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey
        },
        body: JSON.stringify({ approved: !currentApproved })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData(passkey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Price Match Request Handlers
  const [refreshingCentreCom, setRefreshingCentreCom] = useState(false);
  const [centreComRefreshMessage, setCentreComRefreshMessage] = useState<string | null>(null);

  const handlePriceMatchAction = async (id: string, action: 'pending' | 'approved' | 'rejected' | 'more_info') => {
    try {
      const res = await fetch(`/api/admin/cheaper-price-requests/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey
        },
        body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData(passkey);
      }
    } catch (err) {
      console.error('Failed to update price request', err);
    }
  };

  const handleRefreshCentreCom = async () => {
    setRefreshingCentreCom(true);
    setCentreComRefreshMessage(null);
    try {
      const res = await fetch('/api/admin/centrecom/refresh-prices', {
        method: 'POST',
        headers: {
          'x-admin-key': passkey
        }
      });
      const data = await res.json();
      if (data.success) {
        setCentreComRefreshMessage('All component prices confirmed against Centre Com Australian catalogue (AUD incl. GST).');
        setTimeout(() => setCentreComRefreshMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingCentreCom(false);
    }
  };

  const handleUpdateMotherboardStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingMoboStatus(true);
    try {
      const res = await fetch(`/api/admin/customer-motherboards/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey
        },
        body: JSON.stringify({
          adminStatus: status,
          adminNotes: notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedMotherboardRecord(null);
        fetchAdminData(passkey);
      } else {
        alert(data.error || 'Failed to update customer motherboard record');
      }
    } catch (err) {
      console.error('Error updating motherboard record:', err);
      alert('Network error while updating motherboard record');
    } finally {
      setUpdatingMoboStatus(false);
    }
  };

  // Delete review
  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passkey }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData(passkey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save status and technician notes
  const saveStatusUpdate = async () => {
    if (!selectedRequest && !selectedOrder) return;
    setUpdatingStatus(true);
    try {
      let endpoint = '';
      if (selectedOrder) {
        endpoint = `/api/admin/orders/${selectedOrder.id}/status`;
      } else if (selectedRequest.repairCategory) {
        endpoint = `/api/admin/repairs/${selectedRequest.id}/status`;
      } else {
        endpoint = `/api/admin/upgrades/${selectedRequest.id}/status`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey
        },
        body: JSON.stringify({
          status: newStatus,
          technicianNotes: newNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedRequest(null);
        setSelectedOrder(null);
        fetchAdminData(passkey);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="qtr-wrap py-16">
        <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-8 shadow-sm space-y-6 text-center">
          <div className="w-12 h-12 bg-navy text-white rounded-md flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-sky-400" />
          </div>

          <div>
            <h1 className="font-heading text-2xl font-extrabold text-navy">
              QTR Staff Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter administrator passkey to access queues, moderate reviews, and update customer repair states.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Staff Passkey (default: qtr2026)"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-md focus:border-brand-blue focus:outline-none text-center font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy hover:bg-navy-800 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-sky-400" />}
              <span>Unlock Staff Portal</span>
            </button>
          </form>

          <div className="text-[11px] text-slate-400">
            For internal workshop management at 25 Emma St Caulfield South.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qtr-wrap py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-navy">
              QTR Workshop Control Panel
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              Authenticated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            25 Emma St Caufield south 3162 · 0493 711 832
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAdminData(passkey)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
          >
            Lock Out
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 rounded-xl border border-amber-500/30 shadow-xs ring-1 ring-amber-500/20">
            <div className="text-[11px] font-semibold text-amber-500 uppercase flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              <span>PC Orders</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalOrders ?? adminData?.pcOrders?.length ?? 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Repairs</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalRepairs}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Upgrades</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalUpgrades}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Custom Builds</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalCustomPc}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Reviews</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalReviews}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Pending Approval</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.pendingReviewsCount}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Messages</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalMessages}</div>
          </div>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>PC Orders ({adminData?.pcOrders?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('priceMatches')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'priceMatches'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>
            Price Matches ({adminData?.cheaperPriceRequests?.length || 0})
            {(adminData?.cheaperPriceRequests || []).filter((r: any) => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {(adminData?.cheaperPriceRequests || []).filter((r: any) => r.status === 'pending').length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('customerMotherboards')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'customerMotherboards'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>
            Customer Motherboards ({(adminData?.customerSuppliedMotherboards || []).length})
            {(adminData?.customerSuppliedMotherboards || []).filter((m: any) => m.adminStatus === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {(adminData?.customerSuppliedMotherboards || []).filter((m: any) => m.adminStatus === 'pending').length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'shipping'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery Rates &amp; Shipping</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Reviews Moderation ({adminData?.reviews?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('repairs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'repairs'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Repair Requests ({adminData?.repairRequests?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'upgrades'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Upgrade Requests ({adminData?.upgradeRequests?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('pcQuotes')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'pcQuotes'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Custom PC / Prebuilt Quotes ({adminData?.customPcQuotes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'messages'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Contact Messages ({adminData?.contactMessages?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          <span>Centre Com Price Manager</span>
        </button>
      </div>

      {/* Tab Contents */}

      {/* 0. PC ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Live custom PC build orders placed online. Base PC prices exclude labour and delivery. Labour and delivery are calculated and added at checkout.
            </p>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              Total Orders: {adminData?.pcOrders?.length || 0}
            </span>
          </div>

          {(!adminData?.pcOrders || adminData.pcOrders.length === 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700">No PC Orders Yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When customers order Project Eclipse, NITROFORGE X3060, or OVERDRIVE with Fast Build or Full Build &amp; Setup, orders appear here in real time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Order Ref #</th>
                    <th className="p-3.5">Customer &amp; Shipping</th>
                    <th className="p-3.5">Custom PC</th>
                    <th className="p-3.5">Build Service</th>
                    <th className="p-3.5">Delivery Method</th>
                    <th className="p-3.5">Total (AUD)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminData.pcOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-amber-500">
                        {ord.referenceNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">
                        {ord.customerName}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {ord.email} · {ord.phone}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.suburb} {ord.shippingAddress?.state} {ord.shippingAddress?.postcode}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{ord.pcName}</div>
                        <div className="text-[10px] text-slate-500">
                          Parts &amp; Win: ${Number(ord.pcBasePrice).toFixed(2)}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.buildService?.id === 'full'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.buildService?.name || ord.buildService?.id} (+${Number(ord.buildService?.price).toFixed(2)})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">
                          {ord.deliveryMethod?.name} (+${Number(ord.deliveryMethod?.price).toFixed(2)})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.deliveryMethod?.timeframe}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 text-sm">
                          ${Number(ord.finalTotal).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          {ord.paymentMethod?.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Dispatched'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.status === 'Assembly in Progress'
                            ? 'bg-amber-100 text-amber-900'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setSelectedRequest(null);
                            setNewStatus(ord.status);
                            setNewNotes(ord.technicianNotes || '');
                          }}
                          className="bg-slate-900 hover:bg-black text-amber-400 border border-amber-500/40 font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 0.05 CHEAPER PRICE MATCH REQUESTS & CENTRE COM MANAGEMENT */}
      {activeTab === 'priceMatches' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">
                  Cheaper Price Requests (Centre Com Price Match Policy)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary component pricing source: <strong className="text-slate-800">https://www.centrecom.com.au/</strong>. Review competitor offers from authorized Australian retailers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshCentreCom}
                disabled={refreshingCentreCom}
                className="bg-slate-900 hover:bg-black text-amber-400 border border-amber-500/40 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingCentreCom ? 'animate-spin' : ''}`} />
                <span>Re-verify Centre Com Catalogue</span>
              </button>
            </div>
          </div>

          {centreComRefreshMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{centreComRefreshMessage}</span>
            </div>
          )}

          {(!adminData?.cheaperPriceRequests || adminData.cheaperPriceRequests.length === 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700">No Price Match Requests</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When customers submit competitor pricing through the "FOUND A CHEAPER PRICE?" checker, submissions appear here for review and quote adjustment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Request Ref #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Component &amp; Model</th>
                    <th className="p-3.5">Centre Com Reference</th>
                    <th className="p-3.5">Competitor Offer</th>
                    <th className="p-3.5">Delta</th>
                    <th className="p-3.5">Verification Outcome</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminData.cheaperPriceRequests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">
                          {req.referenceNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{req.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{req.email}</div>
                        {req.phone && <div className="text-[10px] text-slate-400">{req.phone}</div>}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{req.partName}</div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                          {req.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold font-mono text-slate-900">{formatAud(req.centreComPrice)}</div>
                        <a
                          href={req.centreComUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline font-semibold"
                        >
                          <span>Centre Com URL</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold font-mono text-slate-900">{formatAud(req.competitorPrice)}</div>
                        <a
                          href={req.competitorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:underline font-semibold max-w-[140px] truncate block"
                        >
                          <span>{req.competitorName || 'View Listing'}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        -{formatAud(req.priceDelta)}
                      </td>
                      <td className="p-3.5">
                        {req.verificationOutcome === 'verified' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Verified Eligible
                          </span>
                        ) : req.verificationOutcome === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Rejected (Ineligible)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Manual Review Req.
                          </span>
                        )}
                        <div className="text-[10px] text-slate-500 mt-1 max-w-[160px] truncate" title={req.verificationReason}>
                          {req.verificationReason}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'approved'
                            ? 'bg-emerald-500 text-white'
                            : req.status === 'rejected'
                            ? 'bg-slate-200 text-slate-700'
                            : req.status === 'more_info'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'Approved Discount' : req.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handlePriceMatchAction(req.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-xs"
                              title="Approve price match and deduct delta from quote"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handlePriceMatchAction(req.id, 'rejected')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] px-2 py-1 rounded-lg border border-rose-200"
                              title="Reject price match"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handlePriceMatchAction(req.id, 'more_info')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] px-2 py-1 rounded-lg"
                              title="Request proof or invoice"
                            >
                              More Info
                            </button>
                          </>
                        )}
                        {req.status !== 'pending' && (
                          <button
                            onClick={() => handlePriceMatchAction(req.id, 'pending')}
                            className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                          >
                            Re-open
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 0.05 CUSTOMER-SUPPLIED MOTHERBOARDS & BENCH INSPECTION */}
      {activeTab === 'customerMotherboards' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Workshop Hardware Diagnostics
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Customer-Supplied Motherboards &amp; Physical Bench Testing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All customer-supplied motherboards researched via AI engine. Verified for socket, chipset, memory DDR generation, and chassis fit. Physical drop-offs at 25 Emma St, Caulfield South VIC 3162 require visual pin check and bench POST verification before assembly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                Total Records: {(adminData?.customerSuppliedMotherboards || []).length}
              </span>
            </div>
          </div>

          {(!adminData?.customerSuppliedMotherboards || adminData.customerSuppliedMotherboards.length === 0) ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-2">
              <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No customer motherboard records logged yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When customers choose "I WILL SUPPLY THIS PART" for a motherboard or submit a custom board model, verified specifications and compatibility analyses will appear here for bench testing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Reference #</th>
                    <th className="p-3.5">Motherboard Details</th>
                    <th className="p-3.5">Verified Specs</th>
                    <th className="p-3.5">Build Context</th>
                    <th className="p-3.5">AI Compatibility</th>
                    <th className="p-3.5">Bench Status</th>
                    <th className="p-3.5">Technician Notes</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminData.customerSuppliedMotherboards.map((mobo: any) => (
                    <tr key={mobo.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">
                          {mobo.referenceNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(mobo.createdAt).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="mt-1 inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {mobo.sourceType === 'catalogue_conversion' ? 'Catalogue $0.00' : 'Custom Entry'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{mobo.brand} {mobo.model}</div>
                        {mobo.conditionNotes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            Customer note: "{mobo.conditionNotes}"
                          </div>
                        )}
                        {mobo.productUrl && (
                          <a
                            href={mobo.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:underline mt-1"
                          >
                            <span>Official Technical Specs</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <div><strong className="text-slate-700">Socket:</strong> {mobo.researchedSpecs?.socket || '—'}</div>
                          <div><strong className="text-slate-700">RAM:</strong> {mobo.researchedSpecs?.ramType || '—'}</div>
                          <div><strong className="text-slate-700">Format:</strong> {mobo.researchedSpecs?.formFactor || '—'}</div>
                          <div><strong className="text-slate-700">Chipset:</strong> {mobo.researchedSpecs?.chipset || '—'}</div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          {mobo.currentBuildSummary?.cpu && (
                            <div><strong className="text-slate-700">CPU:</strong> {mobo.currentBuildSummary.cpu}</div>
                          )}
                          {mobo.currentBuildSummary?.ram && (
                            <div><strong className="text-slate-700">RAM:</strong> {mobo.currentBuildSummary.ram}</div>
                          )}
                          {mobo.currentBuildSummary?.case && (
                            <div><strong className="text-slate-700">Case:</strong> {mobo.currentBuildSummary.case}</div>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            mobo.compatibilityStatus === 'compatible'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mobo.compatibilityStatus === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {mobo.compatibilityStatus}
                        </span>
                        {mobo.compatibilityNotes && mobo.compatibilityNotes.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1 max-w-[200px] line-clamp-2" title={mobo.compatibilityNotes.join('\n')}>
                            {mobo.compatibilityNotes[0]}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mobo.adminStatus === 'inspection_passed'
                              ? 'bg-emerald-500 text-white'
                              : mobo.adminStatus === 'inspection_failed'
                              ? 'bg-rose-500 text-white'
                              : mobo.adminStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mobo.adminStatus === 'rejected'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {mobo.adminStatus === 'inspection_passed'
                            ? 'Inspection Passed'
                            : mobo.adminStatus === 'inspection_failed'
                            ? 'Inspection Failed'
                            : mobo.adminStatus === 'pending'
                            ? 'Pending Bench Test'
                            : mobo.adminStatus}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="text-[11px] text-slate-600 max-w-[160px] truncate">
                          {mobo.adminNotes || 'No notes yet.'}
                        </div>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMotherboardRecord(mobo);
                            setMoboActionStatus(mobo.adminStatus || 'inspection_passed');
                            setMoboActionNotes(mobo.adminNotes || '');
                          }}
                          className="bg-slate-900 hover:bg-black text-amber-400 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-amber-500/40 transition-colors shadow-xs"
                        >
                          Bench Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 0.1 DELIVERY RATES & SHIPPING CONFIGURATION */}
      {activeTab === 'shipping' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Delivery Rates &amp; Timeframes Configuration</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust checkout delivery options shown to customers. Rates are strictly applied on the server during order price validation.
            </p>
          </div>

          {shippingSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Delivery rates and timeframes updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveShipping} className="space-y-6 text-xs">
            {/* Normal Delivery */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Normal Delivery (Standard)</span>
                <span className="text-[11px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">Standard Option</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (AUD $)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={shippingForm.normalPrice}
                    onChange={(e) => setShippingForm({ ...shippingForm, normalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Timeframe Notice</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.normalTimeframe}
                    onChange={(e) => setShippingForm({ ...shippingForm, normalTimeframe: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                    placeholder="e.g. 3–5 business days across Australia"
                  />
                </div>
              </div>
            </div>

            {/* Express Delivery */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-4">
              <div className="font-bold text-amber-950 text-sm flex items-center justify-between">
                <span>Express Delivery (Priority)</span>
                <span className="text-[11px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">Priority Option</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (AUD $)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={shippingForm.expressPrice}
                    onChange={(e) => setShippingForm({ ...shippingForm, expressPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-amber-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Timeframe Notice</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.expressTimeframe}
                    onChange={(e) => setShippingForm({ ...shippingForm, expressTimeframe: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                    placeholder="e.g. 1–2 business days via Express Courier"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingShipping}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                {savingShipping && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
                <span>Save Delivery Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 1. REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Per company policy, newly submitted reviews require administrator approval before appearing publicly to prevent spam.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminData?.reviews?.map((rev: any) => (
              <div
                key={rev.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  rev.approved
                    ? 'bg-white border-slate-200'
                    : 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-300/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{rev.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rev.approved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {rev.approved ? 'Live (Approved)' : 'Pending Approval'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] text-slate-400 ml-2">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{rev.serviceType || 'Service'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReviewApproval(rev.id, rev.approved)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        rev.approved
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {rev.approved ? 'Unpublish' : 'Approve & Publish'}
                    </button>
                    {rev.id !== 'rev-damiano-2026' && (
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. REPAIRS QUEUE */}
      {activeTab === 'repairs' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ref #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Device &amp; Model</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Turns On?</th>
                  <th className="p-3.5">Speed</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminData?.repairRequests?.map((rep: any) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono font-bold text-amber-600">{rep.referenceNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {rep.customerName}
                      <div className="text-[10px] text-slate-400 font-normal">{rep.email} · {rep.phone || 'No phone'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{rep.manufacturerAndModel}</div>
                      <div className="text-[10px] text-slate-400">{rep.deviceType} · {rep.operatingSystem}</div>
                    </td>
                    <td className="p-3.5">{rep.repairCategory}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.turnsOn === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rep.turnsOn}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.serviceSpeed === 'Express' ? 'bg-amber-500/15 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {rep.serviceSpeed}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{rep.status}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(rep);
                          setNewStatus(rep.status);
                          setNewNotes(rep.technicianNotes || '');
                        }}
                        className="bg-slate-900 hover:bg-black text-amber-400 border border-amber-500/30 font-semibold text-[11px] px-3 py-1.5 rounded-lg"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. UPGRADES QUEUE */}
      {activeTab === 'upgrades' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ref #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Device</th>
                  <th className="p-3.5">Desired Upgrades</th>
                  <th className="p-3.5">Target Budget</th>
                  <th className="p-3.5">Speed</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminData?.upgradeRequests?.map((upg: any) => (
                  <tr key={upg.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono font-bold text-amber-600">{upg.referenceNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {upg.customerName}
                      <div className="text-[10px] text-slate-400 font-normal">{upg.email}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{upg.manufacturerAndModel}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {upg.desiredUpgrades?.map((d: string) => (
                          <span key={d} className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">{upg.budget || 'Flexible'}</td>
                    <td className="p-3.5">{upg.serviceSpeed}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{upg.status}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(upg);
                          setNewStatus(upg.status);
                          setNewNotes(upg.technicianNotes || '');
                        }}
                        className="bg-slate-900 hover:bg-black text-amber-400 border border-amber-500/30 font-semibold text-[11px] px-3 py-1.5 rounded-lg"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CUSTOM PC / PREBUILTS */}
      {activeTab === 'pcQuotes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminData?.customPcQuotes?.map((quote: any) => (
              <div key={quote.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono font-bold text-amber-600">{quote.referenceNumber}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                    {quote.buildType}
                  </span>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{quote.customerName} ({quote.email})</div>
                  {quote.prebuiltName && <div className="text-amber-700 font-semibold mt-1">Prebuilt: {quote.prebuiltName}</div>}
                  {quote.totalEstimatedPrice > 0 && (
                    <div className="text-slate-800 font-extrabold mt-1">Total: A${quote.totalEstimatedPrice.toLocaleString()}</div>
                  )}
                  {quote.notes && <p className="text-slate-500 mt-2 italic">"{quote.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminData?.contactMessages?.map((msg: any) => (
              <div key={msg.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <span>{msg.name} ({msg.email})</span>
                  <span className="text-slate-400 font-normal">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-semibold text-amber-700">{msg.subject}</div>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CENTRE COM PRICE MANAGER */}
      {activeTab === 'catalog' && (
        <CentreComPriceManager passkey={passkey} />
      )}

      {/* Status Update Modal (Repairs, Upgrades & PC Orders) */}
      {(selectedRequest || selectedOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold text-amber-500 font-mono">
                  {selectedOrder ? selectedOrder.referenceNumber : selectedRequest?.referenceNumber}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedOrder ? `Update PC Order Status (${selectedOrder.pcName})` : 'Update Service Progress'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setSelectedOrder(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Queue / Order Stage</label>
                {selectedOrder ? (
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Parts Allocated">Parts Allocated</option>
                    <option value="Assembly in Progress">Assembly in Progress</option>
                    <option value="POST / Stress Testing">POST / Stress Testing</option>
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  >
                    <option value="Received">Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assessment & Quote">Assessment &amp; Quote</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technician Diagnostic &amp; Build Notes (Visible to Customer via Live Tracker)
                </label>
                <textarea
                  rows={4}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={
                    selectedOrder
                      ? 'e.g. Ryzen 7 9800X3D and motherboard bench tested. Thermal paste applied, cables routed, Windows 11 installed and activated...'
                      : 'e.g. Heatsink cleaned, thermal paste reapplied, 24h burn-in test passed...'
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={updatingStatus}
                onClick={saveStatusUpdate}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Status Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer-Supplied Motherboard Inspection Modal */}
      {selectedMotherboardRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Technician Bench Diagnostic
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Bench Inspection: {selectedMotherboardRecord.referenceNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMotherboardRecord.brand} {selectedMotherboardRecord.model}
                </p>
              </div>
              <button
                onClick={() => setSelectedMotherboardRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div><strong>Socket / RAM:</strong> {selectedMotherboardRecord.researchedSpecs?.socket} • {selectedMotherboardRecord.researchedSpecs?.ramType} ({selectedMotherboardRecord.researchedSpecs?.formFactor})</div>
                <div><strong>AI Compatibility:</strong> <span className="uppercase font-bold">{selectedMotherboardRecord.compatibilityStatus}</span></div>
                {selectedMotherboardRecord.conditionNotes && (
                  <div><strong>Customer Note:</strong> {selectedMotherboardRecord.conditionNotes}</div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Bench Inspection Status</label>
                <select
                  value={moboActionStatus}
                  onChange={(e) => setMoboActionStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-white"
                >
                  <option value="pending">Pending Bench Drop-off / Visual Check</option>
                  <option value="inspection_passed">Inspection Passed — Socket Pins Straight &amp; Power Rails Verified</option>
                  <option value="inspection_failed">Inspection Failed — Bent Pins / Damaged PCB / No POST</option>
                  <option value="approved">Approved for System Assembly</option>
                  <option value="rejected">Rejected (Incompatible with build parts)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Workshop Bench Inspection Log / Notes
                </label>
                <textarea
                  rows={4}
                  value={moboActionNotes}
                  onChange={(e) => setMoboActionNotes(e.target.value)}
                  placeholder="e.g. Visual socket inspection under magnifying lamp passed (no bent pins). M.2 standoffs checked. Tested POST with bench AM5 CPU and DDR5 test kit. Flashed latest BIOS version 1802. Ready for assembly."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedMotherboardRecord(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={updatingMoboStatus}
                onClick={() => handleUpdateMotherboardStatus(selectedMotherboardRecord.id, moboActionStatus, moboActionNotes)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {updatingMoboStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Bench Inspection Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
