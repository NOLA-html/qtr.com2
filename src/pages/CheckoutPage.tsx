import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Wrench,
  Check,
  X,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Copy,
  Printer,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import {
  BUILD_SERVICES,
  formatAud
} from '../utils/pricing.ts';
import { AddToCalendarButton } from '../components/AddToCalendarButton.tsx';
import { ServiceDisclaimerModal } from '../components/ServiceDisclaimerModal.tsx';
import {
  PeripheralsWarningModal,
  isPeripheralsAcknowledged
} from '../components/PeripheralsWarningModal.tsx';
import { PriceChangeModal, PriceDifferenceItem } from '../components/PriceChangeModal.tsx';

interface CheckoutPageProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
  onNavigateToCatalogue: () => void;
  onNavigateToTrack: (code: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigate,
  onNavigateToCatalogue,
  onNavigateToTrack
}) => {
  const {
    cartItem,
    componentItems,
    buildServiceId,
    updateBuildService,
    deliveryMethodId,
    updateDeliveryMethod,
    updatePcQuantity,
    removeFromCart,
    updateComponentQty,
    removeComponentFromCart,
    clearCart,
    shippingConfig
  } = useCart();

  // Peripherals warning popup when a PC is in cart and not yet acknowledged this session
  const [showPeripheralsModal, setShowPeripheralsModal] = useState(false);

  useEffect(() => {
    if (cartItem && !isPeripheralsAcknowledged()) {
      setShowPeripheralsModal(true);
    }
  }, [cartItem]);

  // Customer enquiry form fields
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [suburb, setSuburb] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping address fields when delivery !== pickup
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [state, setState] = useState('VIC');
  const [postcode, setPostcode] = useState('');

  // Flow & confirmation state
  const [submitting, setSubmitting] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [pendingDisclaimerData, setPendingDisclaimerData] = useState<{
    agreedAt: string;
    version: string;
  } | null>(null);
  const [priceChanges, setPriceChanges] = useState<PriceDifferenceItem[]>([]);
  const [priceTotals, setPriceTotals] = useState<{ original: number; revised: number }>({
    original: 0,
    revised: 0
  });
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<any | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const pcQty = cartItem ? cartItem.quantity : 0;
  const pcPartsSubtotal = cartItem ? cartItem.pc.basePrice * pcQty : 0;
  const componentsSubtotal = componentItems.reduce(
    (sum, item) => sum + item.part.price * item.quantity,
    0
  );
  const buildServicePrice = cartItem ? BUILD_SERVICES[buildServiceId].price : 0;
  const deliveryPrice =
    deliveryMethodId === 'pickup'
      ? 0
      : deliveryMethodId === 'express'
      ? shippingConfig.expressPrice
      : shippingConfig.normalPrice;
  const enquiryTotal = pcPartsSubtotal + componentsSubtotal + buildServicePrice + deliveryPrice;

  const isEmptyCart = !cartItem && componentItems.length === 0;

  const handleCopyRef = (ref: string) => {
    navigator.clipboard?.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Step 1: Validate customer enquiry inputs, then show Service Disclaimer modal
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a contact phone number.');
      return;
    }
    if (deliveryMethodId !== 'pickup') {
      if (!addressLine1.trim() || !suburb.trim() || !postcode.trim()) {
        setErrorMessage(
          'Please enter your street address, suburb, and postcode for delivery calculation.'
        );
        return;
      }
    }

    setShowDisclaimerModal(true);
  };

  // Helper: Execute actual POST /api/orders submission
  const submitFinalOrder = async (disclaimerData: { agreedAt: string; version: string }) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const customPcPayload =
        cartItem && cartItem.pc.id === 'custom-pc-build'
          ? {
              id: cartItem.pc.id,
              name: cartItem.pc.name,
              tagline: cartItem.pc.tagline,
              basePrice: cartItem.pc.basePrice,
              components: cartItem.pc.components
            }
          : undefined;

      const payload = {
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        shippingAddress:
          deliveryMethodId === 'pickup'
            ? {
                addressLine1: 'Workshop Pick-up',
                suburb: suburb.trim() || 'Local Pick-up',
                state: 'VIC',
                postcode: '3162'
              }
            : {
                addressLine1: addressLine1.trim(),
                addressLine2: addressLine2.trim() || undefined,
                suburb: suburb.trim(),
                state: state.trim().toUpperCase(),
                postcode: postcode.trim()
              },
        pcId: cartItem ? cartItem.pc.id : undefined,
        customPc: customPcPayload,
        pcQuantity: pcQty,
        componentItems: componentItems.map((item) => ({
          id: item.part.id,
          name: item.part.name,
          category: item.part.category,
          price: item.part.price,
          quantity: item.quantity
        })),
        buildServiceId: cartItem ? buildServiceId : 'fast',
        deliveryMethodId,
        paymentMethod: 'card',
        notes: notes.trim() || undefined,
        disclaimerAcknowledged: true,
        disclaimerAgreedAt: disclaimerData.agreedAt,
        disclaimerVersion: disclaimerData.version
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order enquiry.');
      }

      setShowDisclaimerModal(false);
      setShowPriceChangeModal(false);
      setOrderConfirmation(data.order);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your enquiry.');
      setShowDisclaimerModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Run live Centre Com recheck after Service Disclaimer acceptance
  const handleConfirmDisclaimer = async (disclaimerData: { agreedAt: string; version: string }) => {
    setPendingDisclaimerData(disclaimerData);
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const recheckParts = [
        ...componentItems.map((c) => ({ id: c.part.id, price: c.part.price })),
        ...(cartItem?.pc.components || []).map((c: any) => ({
          id: c.partId || c.id,
          price: c.price
        }))
      ].filter((p) => Boolean(p.id));

      if (recheckParts.length > 0) {
        const recheckRes = await fetch('/api/centrecom/recheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parts: recheckParts })
        });
        const recheckData = await recheckRes.json();
        if (recheckData.priceChanges && recheckData.priceChanges.length > 0) {
          setPriceChanges(
            recheckData.priceChanges.map((ch: any) => ({
              partId: ch.id,
              name: ch.name,
              oldPrice: ch.oldPrice,
              currentPrice: ch.currentPrice,
              delta: ch.delta
            }))
          );
          setPriceTotals({
            original: Number(recheckData.originalTotal || 0),
            revised: Number(recheckData.revisedTotal || 0)
          });
          setShowDisclaimerModal(false);
          setShowPriceChangeModal(true);
          setSubmitting(false);
          return;
        }
      }
    } catch (checkErr) {
      console.warn('Centre Com live recheck skipped:', checkErr);
    }

    await submitFinalOrder(disclaimerData);
  };

  // Order Confirmation View
  if (orderConfirmation) {
    return (
      <div>
        <div className="border-b border-slate-200 bg-white">
          <div className="qtr-wrap py-10 sm:py-14">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-brand-blue" />
              <span className="qtr-label text-brand-blue">Enquiry received</span>
            </div>
            <h1 className="mt-4 max-w-3xl font-heading text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
              Thank you, {orderConfirmation.customerName}
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
              Your order enquiry is saved under reference{' '}
              <strong className="font-mono text-navy">{orderConfirmation.referenceNumber}</strong>.
              We&apos;ll confirm Centre Com component stock, pricing, and final total before
              arranging payment.
            </p>
          </div>
        </div>

        <div className="qtr-wrap py-10 sm:py-12">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Reference Banner */}
            <div className="rounded-md border border-slate-200 bg-navy p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Enquiry Reference</span>
                </div>
                <div className="mt-1 font-mono text-[26px] font-extrabold tracking-wide">
                  {orderConfirmation.referenceNumber}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCopyRef(orderConfirmation.referenceNumber)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-4 text-[12.5px] font-semibold text-white hover:bg-white/20"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRef ? 'Copied' : 'Copy code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-4 text-[12.5px] font-semibold text-white hover:bg-white/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Breakdown Box */}
            <div className="rounded-md border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="font-heading text-[16px] font-bold text-navy">Enquiry breakdown</h2>
                <span className="text-[11.5px] text-slate-500">AUD incl. GST</span>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">{orderConfirmation.pcName}</span>
                  <span className="font-semibold text-navy">
                    {formatAud(orderConfirmation.pcBasePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Service: {orderConfirmation.buildService?.name}
                  </span>
                  <span className="font-semibold text-navy">
                    {formatAud(orderConfirmation.buildService?.price || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Delivery: {orderConfirmation.deliveryMethod?.name}
                  </span>
                  <span className="font-semibold text-navy">
                    {orderConfirmation.deliveryMethod?.price > 0
                      ? formatAud(orderConfirmation.deliveryMethod.price)
                      : 'No charge / TBC'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                  <span className="font-bold text-navy">Enquiry total</span>
                  <span className="font-heading text-[22px] font-extrabold text-navy">
                    {formatAud(orderConfirmation.finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar reminder */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-[13.5px] font-bold text-navy">
                  Optional Google Calendar reminder
                </h3>
                <p className="text-[12px] text-slate-600 mt-0.5">
                  Save the estimated workshop collection or dispatch window to your calendar.
                </p>
              </div>
              <AddToCalendarButton
                title={`QTR Order Enquiry: ${orderConfirmation.pcName} [${orderConfirmation.referenceNumber}]`}
                description={`Order Enquiry: ${orderConfirmation.pcName}\nTotal: A$${Number(orderConfirmation.finalTotal).toFixed(2)}\nRef: ${orderConfirmation.referenceNumber}\n25 Emma St Caulfield South 3162`}
                daysFromNow={orderConfirmation.deliveryMethod?.id === 'express' ? 3 : 5}
                buttonText="Add to Google Calendar"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToTrack(orderConfirmation.referenceNumber)}
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-6 text-[13.5px] font-semibold text-white hover:bg-navy-800"
              >
                <span>Track enquiry status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmation(null);
                  onNavigateToCatalogue();
                }}
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-[13px] font-semibold text-navy hover:bg-slate-50"
              >
                Back to prebuilt systems
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Peripherals Reminder Alert Dialog */}
      <PeripheralsWarningModal
        isOpen={showPeripheralsModal}
        onAcknowledge={() => setShowPeripheralsModal(false)}
      />

      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="qtr-wrap py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1 text-[11.5px] text-slate-500"
          >
            <a
              href="/"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
              className="hover:text-brand-blue"
            >
              Home
            </a>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
              <span className="text-slate-700">Cart</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Your cart</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Cart and order enquiry
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Prices are shown in AUD including GST. This site takes enquiries rather than payments —
            we confirm stock and the final total with you first.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="qtr-wrap py-10 sm:py-12">
        {isEmptyCart ? (
          <div className="mx-auto max-w-2xl rounded-md border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 font-heading text-[18px] font-bold text-navy">
              Your cart is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
              Browse our prebuilt gaming systems, design your own build with Centre Com component
              pricing, or add individual components.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/prebuilt-pcs"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate ? onNavigate('prebuilt-pcs') : onNavigateToCatalogue();
                }}
                className="inline-flex h-11 items-center rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
              >
                Prebuilt PCs
              </a>
              <a
                href="/builder"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('builder');
                  }
                }}
                className="inline-flex h-11 items-center rounded-md border border-slate-300 bg-white px-5 text-[13px] font-semibold text-navy hover:bg-slate-50"
              >
                Custom PC builder
              </a>
              <a
                href="/components"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('components');
                  }
                }}
                className="inline-flex h-11 items-center rounded-md border border-slate-300 bg-white px-5 text-[13px] font-semibold text-navy hover:bg-slate-50"
              >
                Components
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            {/* Left Column: Items, Build Service, Delivery, Totals */}
            <div className="space-y-4">
              {/* Itemized List */}
              <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
                {cartItem && (
                  <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
                        {cartItem.pc.id === 'custom-pc-build' ? 'Custom build' : 'Prebuilt system'}
                      </p>
                      <p className="mt-1 font-heading text-[14px] font-bold text-navy">
                        {cartItem.pc.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-600">
                        {cartItem.pc.specsSummary?.cpu || cartItem.pc.tagline}
                        {cartItem.pc.specsSummary?.gpu ? ` · ${cartItem.pc.specsSummary.gpu}` : ''}
                      </p>
                      <p className="mt-1 text-[11.5px] text-slate-600">
                        Parts and Windows only — labour and delivery calculated at checkout.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="flex h-9 items-center rounded border border-slate-300">
                        <button
                          type="button"
                          onClick={() => updatePcQuantity(cartItem.quantity - 1)}
                          className="flex h-full w-8 items-center justify-center text-slate-600 hover:text-navy"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-[12.5px] font-semibold text-navy">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updatePcQuantity(cartItem.quantity + 1)}
                          className="flex h-full w-8 items-center justify-center text-slate-600 hover:text-navy"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-heading text-[14px] font-bold text-navy">
                          {formatAud(pcPartsSubtotal)}
                        </span>
                        <button
                          type="button"
                          onClick={removeFromCart}
                          aria-label={`Remove ${cartItem.pc.name}`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                )}

                {componentItems.map(({ part, quantity }) => (
                  <li key={part.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
                        {part.category} · {part.brand}
                      </p>
                      <p className="mt-1 font-heading text-[14px] font-bold text-navy">
                        {part.name}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500">
                        {formatAud(part.price)} each · Centre Com AUD pricing
                      </p>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="flex h-9 items-center rounded border border-slate-300">
                        <button
                          type="button"
                          onClick={() => updateComponentQty(part.id, quantity - 1)}
                          className="flex h-full w-8 items-center justify-center text-slate-600 hover:text-navy"
                          aria-label={`Decrease quantity for ${part.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-[12.5px] font-semibold text-navy">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateComponentQty(part.id, quantity + 1)}
                          className="flex h-full w-8 items-center justify-center text-slate-600 hover:text-navy"
                          aria-label={`Increase quantity for ${part.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-heading text-[14px] font-bold text-navy">
                          {formatAud(part.price * quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeComponentFromCart(part.id)}
                          aria-label={`Remove ${part.name}`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Build Service Selection (for PC systems) */}
              {cartItem && (
                <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-[15px] w-[15px] text-brand-blue" />
                    <h2 className="font-heading text-[15px] font-bold text-navy">
                      Choose a build service
                    </h2>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                    One build service applies to your prebuilt system. It is never charged twice,
                    and Windows is already included in the parts price.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {/* Fast Build */}
                    <button
                      type="button"
                      aria-pressed={buildServiceId === 'fast'}
                      onClick={() => updateBuildService('fast')}
                      className={`flex h-full flex-col rounded-md border p-4 text-left transition ${
                        buildServiceId === 'fast'
                          ? 'border-brand-blue bg-sky-50/50 ring-1 ring-brand-blue'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-heading text-[13.5px] font-bold text-navy">
                          Fast Build
                        </span>
                        <span className="shrink-0 font-heading text-[14px] font-extrabold text-navy">
                          A$100.00
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-600">
                        Assembled correctly, connections checked, power-on self-test (POST) only.
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {BUILD_SERVICES.fast.includes.map((item) => (
                          <li key={item} className="flex gap-1.5 text-[11.5px] leading-snug text-slate-700">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {BUILD_SERVICES.fast.doesNotInclude.map((item) => (
                          <li key={item} className="flex gap-1.5 text-[11.5px] leading-snug text-slate-500">
                            <X className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-slate-200 pt-2.5 text-[11px] leading-relaxed text-slate-600">
                        {BUILD_SERVICES.fast.footnote}
                      </p>
                    </button>

                    {/* Full Build & Setup */}
                    <button
                      type="button"
                      aria-pressed={buildServiceId === 'full'}
                      onClick={() => updateBuildService('full')}
                      className={`flex h-full flex-col rounded-md border p-4 text-left transition ${
                        buildServiceId === 'full'
                          ? 'border-brand-blue bg-sky-50/50 ring-1 ring-brand-blue'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-heading text-[13.5px] font-bold text-navy">
                          Full Build &amp; Setup
                        </span>
                        <span className="shrink-0 font-heading text-[14px] font-extrabold text-navy">
                          A$250.00
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-600">
                        {BUILD_SERVICES.full.description}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {BUILD_SERVICES.full.includes.map((item) => (
                          <li key={item} className="flex gap-1.5 text-[11.5px] leading-snug text-slate-700">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-slate-200 pt-2.5 text-[11px] leading-relaxed text-slate-600">
                        {BUILD_SERVICES.full.footnote}
                      </p>
                    </button>
                  </div>
                </section>
              )}

              {/* Delivery method */}
              <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Truck className="h-[15px] w-[15px] text-brand-blue" />
                  <h2 className="font-heading text-[15px] font-bold text-navy">Delivery method</h2>
                </div>

                <div className="mt-4 space-y-2">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition ${
                      deliveryMethodId === 'pickup'
                        ? 'border-brand-blue bg-sky-50/60 ring-1 ring-brand-blue'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-method"
                      value="pickup"
                      checked={deliveryMethodId === 'pickup'}
                      onChange={() => updateDeliveryMethod('pickup')}
                      className="mt-0.5 h-4 w-4 accent-sky-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-heading text-[13px] font-bold text-navy">Pick up</span>
                        <span className="font-heading text-[13px] font-bold text-navy">No charge</span>
                      </span>
                      <span className="mt-1 block text-[11.5px] text-slate-600">
                        Collect from us once the build or repair is ready.
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition ${
                      deliveryMethodId === 'normal'
                        ? 'border-brand-blue bg-sky-50/60 ring-1 ring-brand-blue'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-method"
                      value="normal"
                      checked={deliveryMethodId === 'normal'}
                      onChange={() => updateDeliveryMethod('normal')}
                      className="mt-0.5 h-4 w-4 accent-sky-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-heading text-[13px] font-bold text-navy">
                          Normal delivery
                        </span>
                        <span className="font-heading text-[13px] font-bold text-navy">
                          {formatAud(shippingConfig.normalPrice)} ({shippingConfig.normalTimeframe})
                        </span>
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition ${
                      deliveryMethodId === 'express'
                        ? 'border-brand-blue bg-sky-50/60 ring-1 ring-brand-blue'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-method"
                      value="express"
                      checked={deliveryMethodId === 'express'}
                      onChange={() => updateDeliveryMethod('express')}
                      className="mt-0.5 h-4 w-4 accent-sky-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-heading text-[13px] font-bold text-navy">
                          Express delivery
                        </span>
                        <span className="font-heading text-[13px] font-bold text-navy">
                          {formatAud(shippingConfig.expressPrice)} ({shippingConfig.expressTimeframe})
                        </span>
                      </span>
                      <span className="mt-1 block text-[11.5px] text-slate-600">
                        Priority expedited dispatch. Timeframes are estimates confirmed before
                        dispatch.
                      </span>
                    </span>
                  </label>
                </div>

                {/* Delivery address inputs when Normal or Express delivery selected */}
                {deliveryMethodId !== 'pickup' && (
                  <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="ship-addr1" className="text-[12px] font-semibold text-slate-700">
                        Street address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="ship-addr1"
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. 42 Glenhuntly Road"
                        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="ship-addr2" className="text-[12px] font-semibold text-slate-700">
                        Unit / Suite (optional)
                      </label>
                      <input
                        id="ship-addr2"
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="ship-state" className="text-[12px] font-semibold text-slate-700">
                        State <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="ship-state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-brand-blue focus:outline-none"
                      >
                        <option value="VIC">VIC</option>
                        <option value="NSW">NSW</option>
                        <option value="QLD">QLD</option>
                        <option value="WA">WA</option>
                        <option value="SA">SA</option>
                        <option value="TAS">TAS</option>
                        <option value="ACT">ACT</option>
                        <option value="NT">NT</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="ship-postcode" className="text-[12px] font-semibold text-slate-700">
                        Postcode <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="ship-postcode"
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. 3162"
                        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
                  Shipping is calculated from your delivery address and postcode and shown as its own
                  line, with any express service fee listed separately. Timeframes are estimates
                  only — we confirm them with you before dispatch.
                </p>
              </section>

              {/* Enquiry Total Summary */}
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="space-y-2.5 p-4">
                  {cartItem && (
                    <div className="flex justify-between text-[12.5px] text-slate-600">
                      <span>Parts and Windows</span>
                      <span className="font-semibold text-navy">{formatAud(pcPartsSubtotal)}</span>
                    </div>
                  )}
                  {componentItems.length > 0 && (
                    <div className="flex justify-between text-[12.5px] text-slate-600">
                      <span>Individual components ({componentItems.reduce((s, i) => s + i.quantity, 0)})</span>
                      <span className="font-semibold text-navy">{formatAud(componentsSubtotal)}</span>
                    </div>
                  )}
                  {cartItem && (
                    <div className="flex justify-between text-[12.5px] text-slate-600">
                      <span>Build service ({BUILD_SERVICES[buildServiceId].name})</span>
                      <span className="font-semibold text-navy">{formatAud(buildServicePrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[12.5px] text-slate-600">
                    <span>
                      {deliveryMethodId === 'pickup'
                        ? 'Pick up'
                        : deliveryMethodId === 'express'
                        ? 'Express delivery'
                        : 'Normal delivery'}
                    </span>
                    <span className="font-semibold text-navy">
                      {deliveryMethodId === 'pickup' ? 'No charge' : formatAud(deliveryPrice)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                    <span className="text-[13px] font-bold text-navy">Enquiry total</span>
                    <span className="font-heading text-[20px] font-extrabold text-navy">
                      {formatAud(enquiryTotal)}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Labour and delivery calculated at checkout. Delivery is calculated at checkout
                    from your delivery address and postcode.
                  </p>
                </div>
              </div>

              {/* Trust Notice */}
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-600">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" />
                  No card details are collected or stored on this site. Payment is arranged directly
                  with QTR once your total is confirmed.
                </p>
              </div>
            </div>

            {/* Right Column: Order Enquiry Form */}
            <form
              onSubmit={handlePlaceOrder}
              className="rounded-md border border-slate-200 bg-white p-5 sm:p-6"
              noValidate
            >
              <h2 className="font-heading text-[16px] font-bold text-navy">
                Send an order enquiry
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-600">
                We&apos;ll confirm stock, component pricing and the final total before you pay
                anything.
              </p>

              {errorMessage && (
                <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="mt-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="c-name" className="text-[12.5px] font-semibold text-slate-700">
                    Full name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="c-email" className="text-[12.5px] font-semibold text-slate-700">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="c-phone" className="text-[12.5px] font-semibold text-slate-700">
                      Phone <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="c-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="c-suburb" className="text-[12.5px] font-semibold text-slate-700">
                      Suburb
                    </label>
                    <input
                      id="c-suburb"
                      type="text"
                      autoComplete="address-level2"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="c-notes" className="text-[12.5px] font-semibold text-slate-700">
                    Anything we should know?
                  </label>
                  <textarea
                    id="c-notes"
                    rows={3}
                    maxLength={1200}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex min-h-[60px] w-full resize-none rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 py-2 text-[13.5px] font-semibold text-white shadow transition-colors hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Submit enquiry — {formatAud(enquiryTotal)}</span>
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-500">
                No payment is taken now. We&apos;ll confirm everything first.
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Service Disclaimer Modal */}
      <ServiceDisclaimerModal
        isOpen={showDisclaimerModal}
        onConfirm={handleConfirmDisclaimer}
        onCancel={() => setShowDisclaimerModal(false)}
        isSubmitting={submitting}
      />

      {/* Centre Com Live Price Recheck Confirmation Modal */}
      <PriceChangeModal
        isOpen={showPriceChangeModal}
        onConfirm={() => {
          if (pendingDisclaimerData) {
            submitFinalOrder(pendingDisclaimerData);
          }
        }}
        onCancel={() => setShowPriceChangeModal(false)}
        priceChanges={priceChanges}
        originalTotal={priceTotals.original}
        revisedTotal={priceTotals.revised}
      />
    </div>
  );
};
