import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Plus,
  Download,
  History,
  Check,
  X,
  AlertOctagon,
  Tag,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { formatAud } from '../utils/pricing.ts';

interface ProductItem {
  productId: string;
  manufacturer: string;
  model: string;
  category: string;
  retailer: 'Centre Com';
  productUrl: string;
  priceAUD: number | null;
  currency: 'AUD';
  imageUrl: string | null;
  status: 'active' | 'stale' | 'unavailable' | 'price_check_failed' | 'needs_review';
  lastCheckedAt: string | null;
  lastSuccessfulCheckAt: string | null;
  priceSource: 'Centre Com';
  lastKnownPriceAUD: number | null;
  refreshAttempts: number;
  nextRefreshAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastErrorCode: string | null;
  manualVerificationNote?: string;
  manuallyVerifiedBy?: string;
}

interface PriceHistoryEntry {
  id: string;
  productId: string;
  priceAUD: number;
  currency: 'AUD';
  productUrl: string;
  checkedAt: string;
  previousPriceAUD: number | null;
  changeType: 'initial' | 'increase' | 'decrease' | 'unchanged';
  verificationMethod: string;
  adminNotes?: string;
}

interface StatsData {
  totalProducts: number;
  activeCount: number;
  staleCount: number;
  needsReviewCount: number;
  failedCount: number;
  unavailableCount: number;
  totalHistoryRecords: number;
  lastBatchRunAt: string | null;
  scheduledIntervalHours: number;
  isSchedulerActive: boolean;
}

interface CentreComPriceManagerProps {
  passkey: string;
}

export const CentreComPriceManager: React.FC<CentreComPriceManagerProps> = ({ passkey }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);

  // Manual verify modal state
  const [verifyProduct, setVerifyProduct] = useState<ProductItem | null>(null);
  const [manualPrice, setManualPrice] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Price history modal state
  const [historyProduct, setHistoryProduct] = useState<ProductItem | null>(null);
  const [historyList, setHistoryList] = useState<PriceHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdId, setNewProdId] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState('cpu');
  const [newUrl, setNewUrl] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  const fetchProductsAndStats = async () => {
    try {
      setLoading(true);
      const [prodRes, statsRes] = await Promise.all([
        fetch('/api/firebase/products'),
        fetch('/api/firebase/stats')
      ]);
      const prodData = await prodRes.json();
      const statsData = await statsRes.json();

      if (prodData.success) {
        setProducts(prodData.products || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load Centre Com pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndStats();
  }, []);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Refresh single product
  const handleRefreshSingle = async (productId: string) => {
    setRefreshingId(productId);
    try {
      const res = await fetch(`/api/firebase/products/${encodeURIComponent(productId)}/refresh`, {
        method: 'POST',
        headers: { 'x-admin-key': passkey }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Price updated: $${data.product.priceAUD} AUD`);
        fetchProductsAndStats();
      } else {
        showToast(`Notice: ${data.message || data.error}`);
        fetchProductsAndStats();
      }
    } catch (err: any) {
      showToast(`Refresh error: ${err.message}`);
    } finally {
      setRefreshingId(null);
    }
  };

  // Run batch refresh
  const handleRunBatch = async () => {
    setBatchRunning(true);
    try {
      const res = await fetch('/api/firebase/products/refresh-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': passkey },
        body: JSON.stringify({ maxBatchSize: 6 })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Batch completed: ${data.processed} products checked (${data.successCount} verified, ${data.changedCount} changed prices, ${data.failureCount} failed).`);
        fetchProductsAndStats();
      } else {
        showToast(`Batch failed: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Batch error: ${err.message}`);
    } finally {
      setBatchRunning(false);
    }
  };

  // Reseed / Sync master catalog
  const handleSyncMaster = async () => {
    try {
      const res = await fetch('/api/firebase/sync-catalog', {
        method: 'POST',
        headers: { 'x-admin-key': passkey }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Synchronized master catalogue.`);
        fetchProductsAndStats();
      }
    } catch (err: any) {
      showToast(`Sync error: ${err.message}`);
    }
  };

  // Open manual verify modal
  const handleOpenManualVerify = (product: ProductItem) => {
    setVerifyProduct(product);
    setManualPrice(product.priceAUD ? product.priceAUD.toString() : '');
    setManualNotes(product.manualVerificationNote || 'Audited against current Centre Com store page');
  };

  // Submit manual verify
  const handleSubmitManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyProduct) return;
    setSubmittingManual(true);
    try {
      const res = await fetch(`/api/firebase/products/${encodeURIComponent(verifyProduct.productId)}/manual-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': passkey },
        body: JSON.stringify({
          priceAUD: parseFloat(manualPrice),
          adminNotes: manualNotes,
          adminUser: 'Administrator'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully verified: ${verifyProduct.model} set to ${formatAud(parseFloat(manualPrice))} (Manual Audit Record Created)`);
        setVerifyProduct(null);
        fetchProductsAndStats();
      } else {
        alert(data.error || 'Failed to manually verify price');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Open Price History
  const handleViewHistory = async (product: ProductItem) => {
    setHistoryProduct(product);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/firebase/products/${encodeURIComponent(product.productId)}/history`);
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const res = await fetch('/api/firebase/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': passkey },
        body: JSON.stringify({
          productId: newProdId.trim(),
          manufacturer: newManufacturer.trim(),
          model: newModel.trim(),
          category: newCategory,
          productUrl: newUrl.trim(),
          priceAUD: newPrice ? parseFloat(newPrice) : null,
          imageUrl: newImage.trim() || null
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Product added: ${data.product.model}`);
        setShowAddModal(false);
        setNewProdId('');
        setNewManufacturer('');
        setNewModel('');
        setNewUrl('');
        setNewPrice('');
        setNewImage('');
        fetchProductsAndStats();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Product ID', 'Manufacturer', 'Model', 'Category', 'Price AUD', 'Status', 'Centre Com URL', 'Last Checked', 'Last Successful Check'];
    const rows = products.map((p) => [
      `"${p.productId}"`,
      `"${p.manufacturer}"`,
      `"${p.model.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.priceAUD || '',
      `"${p.status}"`,
      `"${p.productUrl}"`,
      `"${p.lastCheckedAt || ''}"`,
      `"${p.lastSuccessfulCheckAt || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `centrecom_pricing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [repairingCatalogue, setRepairingCatalogue] = useState(false);

  const handleRepairCatalogue = async () => {
    setRepairingCatalogue(true);
    try {
      const res = await fetch('/api/admin/repair-centrecom-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey
        }
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Catalogue Repair Complete: verified ${data.repairedCount} Centre Com product entries with Australian AUD pricing and direct links.`);
        await fetchProductsAndStats();
      } else {
        alert(data.error || 'Failed to repair catalogue');
      }
    } catch (err: any) {
      console.error('Error repairing catalogue:', err);
      alert('Network error while running catalogue repair');
    } finally {
      setRepairingCatalogue(false);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.model.toLowerCase().includes(search.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        p.productId.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.status === 'active') ||
        (statusFilter === 'stale' && p.status === 'stale') ||
        (statusFilter === 'needs_review' && p.status === 'needs_review') ||
        (statusFilter === 'price_check_failed' && p.status === 'price_check_failed') ||
        (statusFilter === 'unavailable' && p.status === 'unavailable');

      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-slate-900 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Exclusive Primary Source: Centre Com
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Centre Com Price Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud Firestore product catalog with automated price refresh, rate limiting, and auditable history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunBatch}
            disabled={batchRunning}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:bg-slate-300 text-amber-400 border border-amber-500/40 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${batchRunning ? 'animate-spin' : ''}`} />
            <span>{batchRunning ? 'Processing Batch...' : 'Run Scheduled Batch'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncMaster}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Sync Catalogue</span>
          </button>

          <button
            type="button"
            onClick={handleRepairCatalogue}
            disabled={repairingCatalogue}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Batch repair and audit Centre Com direct product links and Australian pricing"
          >
            <Sparkles className={`w-3.5 h-3.5 ${repairingCatalogue ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
            <span>{repairingCatalogue ? 'Repairing...' : 'Repair Centre Com Products'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Part</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Tracked</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">{stats.totalProducts}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Centre Com components</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-emerald-700">Verified Active</div>
            <div className="text-xl font-black text-emerald-800 font-mono mt-1">{stats.activeCount}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Current AUD prices</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-amber-700">Stale / Due</div>
            <div className="text-xl font-black text-amber-800 font-mono mt-1">{stats.staleCount}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Scheduled for refresh</div>
          </div>
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-orange-700">Needs Review</div>
            <div className="text-xl font-black text-orange-800 font-mono mt-1">{stats.needsReviewCount}</div>
            <div className="text-[10px] text-orange-600 mt-0.5">Manual check recommended</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-rose-700">Failed Checks</div>
            <div className="text-xl font-black text-rose-800 font-mono mt-1">{stats.failedCount}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">In backoff retry queue</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-slate-600">History Logs</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">{stats.totalHistoryRecords}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Audit entries preserved</div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model, manufacturer, or part ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Status: All</option>
            <option value="active">Active (Verified)</option>
            <option value="stale">Stale (Due)</option>
            <option value="needs_review">Needs Review</option>
            <option value="price_check_failed">Failed Check</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
          >
            <option value="all">Category: All</option>
            <option value="cpu">CPU</option>
            <option value="motherboard">Motherboard</option>
            <option value="ram">RAM</option>
            <option value="gpu">GPU</option>
            <option value="storage">Storage</option>
            <option value="cooler">Cooler</option>
            <option value="case">Case</option>
            <option value="psu">PSU</option>
            <option value="fans">Fans</option>
            <option value="os">OS</option>
          </select>

          <button
            type="button"
            onClick={fetchProductsAndStats}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Component &amp; Model</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Centre Com Link</th>
                <th className="p-3.5">Verified AUD Price</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5">Last Checked</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products matched your search or filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isRefreshing = refreshingId === p.productId;
                  return (
                    <tr key={p.productId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Component info */}
                      <td className="p-3.5 flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.model}
                            className="w-10 h-10 object-contain p-1 rounded-xl border border-slate-200 bg-white shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 font-bold text-[10px]">
                            {p.category.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-xs">{p.model}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.manufacturer} • {p.productId}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Centre Com URL */}
                      <td className="p-3.5">
                        <a
                          href={p.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-800 hover:underline max-w-[150px] truncate"
                          title={p.productUrl}
                        >
                          <span className="truncate">centrecom.com.au</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      {/* Verified Price */}
                      <td className="p-3.5">
                        <div className="font-mono font-black text-sm text-slate-900">
                          {p.priceAUD !== null ? formatAud(p.priceAUD) : '—'}
                        </div>
                        {p.manualVerificationNote && (
                          <div className="text-[10px] text-amber-700 font-medium">Manual Stamp</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {p.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Verified Current
                          </span>
                        )}
                        {p.status === 'stale' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Stale (Due)
                          </span>
                        )}
                        {p.status === 'needs_review' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                            <AlertTriangle className="w-3 h-3" />
                            Needs Review
                          </span>
                        )}
                        {p.status === 'price_check_failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertOctagon className="w-3 h-3" />
                            Check Failed ({p.refreshAttempts}/3)
                          </span>
                        )}
                        {p.status === 'unavailable' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Unavailable
                          </span>
                        )}
                        {p.lastErrorCode && (
                          <div className="text-[9px] text-rose-600 font-mono mt-0.5 truncate max-w-[120px]" title={p.lastErrorCode}>
                            {p.lastErrorCode}
                          </div>
                        )}
                      </td>

                      {/* Timestamps */}
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        <div>{p.lastSuccessfulCheckAt ? new Date(p.lastSuccessfulCheckAt).toLocaleDateString('en-AU') : 'Pending'}</div>
                        <div className="text-[10px] text-slate-400">
                          {p.lastSuccessfulCheckAt ? new Date(p.lastSuccessfulCheckAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRefreshSingle(p.productId)}
                            disabled={isRefreshing}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Refresh price from Centre Com"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenManualVerify(p)}
                            className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Manually verify & record price"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewHistory(p)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="View price history logs"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Price Verification Modal */}
      {verifyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                  Manual Price Verification
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Verify {verifyProduct.model}
                </h3>
              </div>
              <button onClick={() => setVerifyProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitManualVerify} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500">Current Saved Price:</div>
                <div className="font-mono font-black text-slate-900 text-base">
                  {verifyProduct.priceAUD ? formatAud(verifyProduct.priceAUD) : 'Unset'}
                </div>
                <a
                  href={verifyProduct.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:underline pt-1"
                >
                  <span>Open Centre Com Listing</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Verified Centre Com Price in AUD (incl. GST) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="e.g. 319.00"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Verification Notes / Source Reference *
                </label>
                <textarea
                  rows={2}
                  required
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Confirmed in-stock Centre Com retail price matching SKU."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyProduct(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {submittingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Verified Price</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                  Audit History
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Price History: {historyProduct.model}
                </h3>
              </div>
              <button onClick={() => setHistoryProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {loadingHistory ? (
                <div className="p-8 text-center text-slate-400">Loading history logs...</div>
              ) : historyList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No previous price changes recorded yet.</div>
              ) : (
                historyList.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono font-black text-slate-900 text-sm">
                        {formatAud(entry.priceAUD)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(entry.checkedAt).toLocaleString('en-AU')} •{' '}
                        <span className="font-semibold text-slate-700">{entry.verificationMethod}</span>
                      </div>
                      {entry.adminNotes && (
                        <div className="text-[10px] text-amber-700 mt-0.5 italic">{entry.adminNotes}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          entry.changeType === 'increase'
                            ? 'bg-rose-100 text-rose-800'
                            : entry.changeType === 'decrease'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {entry.changeType}
                      </span>
                      {entry.previousPriceAUD !== null && (
                        <div className="text-[10px] text-slate-400 line-through mt-0.5">
                          {formatAud(entry.previousPriceAUD)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHistoryProduct(null)}
                className="px-4 py-2 font-bold text-xs bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                  New Component
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Add Centre Com Component
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unique Product ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cpu-r7-9800x3d"
                  value={newProdId}
                  onChange={(e) => setNewProdId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AMD, ASUS, Corsair"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="cpu">CPU</option>
                    <option value="motherboard">Motherboard</option>
                    <option value="ram">RAM</option>
                    <option value="gpu">GPU</option>
                    <option value="storage">Storage</option>
                    <option value="cooler">Cooler</option>
                    <option value="case">Case</option>
                    <option value="psu">PSU</option>
                    <option value="fans">Fans</option>
                    <option value="os">OS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Exact Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMD Ryzen 7 9800X3D Processor"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Centre Com Product URL * (Must be centrecom.com.au)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.centrecom.com.au/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Price (AUD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 749.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {addingProduct ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
