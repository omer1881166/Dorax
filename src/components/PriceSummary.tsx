"use client";

import React, { useState } from 'react';
import { useConfigStore } from '@/store/useConfigStore';
import { ShoppingCart, CheckCircle, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const PriceSummary: React.FC = () => {
    const {
        getSelectedCategory,
        selections,
        calculateTotalPrice,
        selectedCountry,
        quantities,
        pduLayout,
        theme
    } = useConfigStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<{
        success: boolean;
        serverPrice?: number;
        basePrice?: number;
        regionalAdjustment?: number;
        error?: string;
    } | null>(null);

    const category = getSelectedCategory();
    const totalPrice = calculateTotalPrice();
    const isPduCategory = category?.id === '00000000-0000-0000-0000-000000000001' || (category?.name?.toLowerCase().includes('pdu') ?? false);

    const handleGetInquiry = async () => {
        setIsSubmitting(true);
        setVerificationResult(null);
        setOrderSuccess(null);

        try {
            const response = await fetch('/api/calculate-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: category?.id,
                    selections: selections,
                    quantities: quantities,
                    countryId: selectedCountry?.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                const isMatch = Math.abs(data.total - Math.round(totalPrice)) <= 1;
                setVerificationResult({
                    success: isMatch,
                    serverPrice: data.total,
                    basePrice: data.basePrice,
                    regionalAdjustment: data.regionalAdjustment,
                    error: isMatch ? undefined : 'Price mismatch detected. Please contact support.'
                });
            } else {
                setVerificationResult({ success: false, error: data.error || 'Failed to verify price' });
            }
        } catch (err) {
            setVerificationResult({ success: false, error: 'Network error during verification' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitOrder = async () => {
        if (!customerEmail || !verificationResult?.success) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerEmail,
                    customerName,
                    categoryId: category?.id,
                    countryId: selectedCountry?.id,
                    selections,
                    quantities,
                    layout: pduLayout,
                    totalPrice: verificationResult.serverPrice,
                    basePrice: verificationResult.basePrice,
                    regionalAdjustment: verificationResult.regionalAdjustment
                })
            });

            const data = await response.json();
            console.log('Submission Response:', data);
            
            if (response.ok) {
                setOrderSuccess(data.orderId);
            } else {
                console.error('Submission Failed:', data.error);
                setVerificationResult({ ...verificationResult, error: data.error || 'Failed to submit inquiry' });
            }
        } catch (err) {
            console.error('Submission Network Error:', err);
            setVerificationResult({ ...verificationResult, error: 'Network error during submission' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!category) return null;

    // Internal PDU keys that should NOT be looked up in category attributes automatically
    const pduInternalKeys = [
        '00000000-0000-0000-0000-000000000101', // Orientation
        '00000000-0000-0000-0000-000000000102', // Color
        '00000000-0000-0000-0000-000000000104', // Energy Input
        '00000000-0000-0000-0000-000000000105', // Cable Type
        'pdu_case_type', 'pdu_case_color', 'pdu_case_length', 'pdu_cable_cross_section', 
        '_pdu_sockets_confirmed', '_pdu_cable_props_confirmed', '_pdu_protection_confirmed', '_pdu_calculation_confirmed', '_pdu_layout_confirmed'
    ];

    // Hardcoded lookup maps for energy, security and cable length
    const energyInputMap: Record<string, { label: string; cost: number }> = {};
    const securityMap: Record<string, { label: string; cost: number }> = {};
    const calculationMap: Record<string, { label: string; cost: number }> = {};
    const cableLengthMap: Record<string, { label: string; cost: number }> = {};

    // Populated from DB via useConfigStore
    category.attributes.forEach(attr => {
        attr.options.forEach(opt => {
            if (attr.id === '00000000-0000-0000-0000-000000000104') energyInputMap[opt.id] = { label: opt.label, cost: opt.addedCost };
            if (attr.id === '00000000-0000-0000-0000-000000000106' || attr.name.toLowerCase().includes('protection')) securityMap[opt.id] = { label: opt.label, cost: opt.addedCost };
            if (attr.id === '00000000-0000-0000-0000-000000000107' || attr.name.toLowerCase().includes('calculation')) calculationMap[opt.id] = { label: opt.label, cost: opt.addedCost };
        });
    });

    const selectedOptionsBreakdown = Object.entries(selections)
        .filter(([attrId]) => !pduInternalKeys.includes(attrId))
        .map(([attrId, optId]) => {
            const attr = category.attributes.find(a => a.id === attrId);
            const opt = attr?.options.find(o => o.id === optId);
            return {
                name: attr?.name,
                label: opt?.label,
                cost: opt?.addedCost || 0,
                count: 1
            };
        });

    // Add PDU orientation label
    const orientationId = selections['00000000-0000-0000-0000-000000000101'];
    if (orientationId) {
        const opt = category.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000101')?.options.find(o => o.id === orientationId);
        selectedOptionsBreakdown.push({
            name: 'PDU Type',
            label: opt?.label || orientationId,
            cost: opt?.addedCost || 0,
            count: 1
        });
    }

    // Add PDU color
    const colorId = selections['00000000-0000-0000-0000-000000000102'];
    if (colorId) {
        const opt = category.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000102')?.options.find(o => o.id === colorId);
        selectedOptionsBreakdown.push({
            name: 'PDU Color',
            label: opt?.label || colorId,
            cost: opt?.addedCost || 0,
            count: 1
        });
    }

    // Add multi-quantity socket items
    Object.entries(quantities).forEach(([optId, count]) => {
        if (count <= 0) return;
        category.attributes.forEach(attr => {
            const opt = attr.options.find(o => o.id === optId);
            if (opt) {
                selectedOptionsBreakdown.push({
                    name: 'Socket Module',
                    label: `${opt.label} (x${count})`,
                    cost: opt.addedCost * count,
                    count: count
                });
            }
        });
    });

    // Add PDU energy input
    const energyId = selections['00000000-0000-0000-0000-000000000104'];
    if (energyId && energyInputMap[energyId]) {
        selectedOptionsBreakdown.push({
            name: 'Energy Input',
            label: energyInputMap[energyId].label,
            cost: energyInputMap[energyId].cost,
            count: 1
        });
    }

    // Add Cable Type
    const outerCaseId = '00000000-0000-0000-0000-000000000502';
    const nonCableId = '00000000-0000-0000-0000-000000000501';
    const cableTypeId = selections['00000000-0000-0000-0000-000000000105'];
    
    if (cableTypeId) {
        selectedOptionsBreakdown.push({
            name: 'Cable Configuration',
            label: cableTypeId === outerCaseId ? 'Outer Case' : 'Non Cable',
            cost: 0,
            count: 1
        });
    }

    // Add Properties Of Cable (if Outer Case)
    if (cableTypeId === outerCaseId) {
        const cableProps = [
            { key: 'pdu_case_type', name: 'Type Of Case' },
            { key: 'pdu_case_color', name: 'Color' },
            { key: 'pdu_case_length', name: 'Length' },
            { key: 'pdu_cable_cross_section', name: 'Cable Cross Section' },
        ];
        cableProps.forEach(({ key, name }) => {
            const val = selections[key];
            if (val) {
                selectedOptionsBreakdown.push({
                    name,
                    label: val,
                    cost: 0,
                    count: 1
                });
            }
        });
    }

    // Add multi-quantity protection items
    Object.entries(quantities).forEach(([optId, count]) => {
        if (count <= 0 || !optId.startsWith('prot_')) return;
        const baseId = optId.replace('prot_', '');
        const securityOpt = securityMap[baseId];
        if (securityOpt) {
            selectedOptionsBreakdown.push({
                name: 'Protection Module',
                label: `${securityOpt.label} (x${count})`,
                cost: securityOpt.cost * count,
                count: count
            });
        }
    });

    // Add Calculation Modules (Multi-Quantity)
    Object.entries(quantities).forEach(([key, count]) => {
        if (!key.startsWith('calc_')) return;
        const baseId = key.replace('calc_', '');
        if (calculationMap[baseId] && count > 0) {
            const item = calculationMap[baseId];
            selectedOptionsBreakdown.push({
                name: 'Calculation Module',
                label: `${item.label} (x${count})`,
                cost: item.cost * count,
                count: count
            });
        }
    });

    // Add PDU cable length
    const cableId = selections['pdu_cable_length'];
    if (cableId && cableLengthMap[cableId]) {
        selectedOptionsBreakdown.push({
            name: 'Cable Length',
            label: cableLengthMap[cableId].label,
            cost: cableLengthMap[cableId].cost,
            count: 1
        });
    }

    const getVisibleAttributes = () => {
        if (!category) return [];
        return category.attributes.filter(attr => {
            const options = useConfigStore.getState().getFilteredOptions(attr.id);
            return options.length > 0;
        });
    };

    const visibleAttributes = getVisibleAttributes();
    const standardAttrsComplete = visibleAttributes
        .filter(a => a.id !== 'pdu_subtype')
        .every(attr => selections[attr.id]);

    const isPduComplete = isPduCategory && 
        selections['00000000-0000-0000-0000-000000000101'] && // Orientation
        selections['00000000-0000-0000-0000-000000000102'] && // Color
        selections['_pdu_sockets_confirmed'] === 'true' &&
        selections['00000000-0000-0000-0000-000000000104'] && // Energy
        selections['00000000-0000-0000-0000-000000000105'] && // Cable
        (selections['00000000-0000-0000-0000-000000000105'] !== '00000000-0000-0000-0000-000000000502' || selections['_pdu_cable_props_confirmed'] === 'true') &&
        selections['_pdu_protection_confirmed'] === 'true' &&
        selections['_pdu_calculation_confirmed'] === 'true' &&
        selections['_pdu_layout_confirmed'] === 'true';

    const isComplete = isPduCategory ? isPduComplete : standardAttrsComplete;

    return (
        <div className="w-full lg:w-96">
            <div className="bg-[var(--bg-card)] border border-[var(--border-app)] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
                <div className="p-8 border-b border-[var(--border-app)] bg-[var(--bg-app)]/50">
                    <h3 className="text-xl font-black text-[var(--text-app)] flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-[var(--accent-brand)]" />
                        Live Quote
                    </h3>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            <span>Base Configuration</span>
                            <span className="text-[var(--text-app)]">{category.basePrice} €</span>
                        </div>

                        <div className="space-y-3 pt-2">
                            {selectedOptionsBreakdown.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start text-[13px] group">
                                    <div className="flex flex-col">
                                        <span className="text-[var(--text-muted)] font-bold uppercase text-[10px] tracking-tight">{item.name}</span>
                                        <span className="text-[var(--text-app)] font-bold">{item.label}</span>
                                    </div>
                                    <span className="text-[var(--text-muted)] font-medium">+{item.cost} €</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--border-app)] space-y-4">
                        {selectedCountry && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[12px] font-bold text-[var(--text-muted)] group cursor-pointer" onClick={() => useConfigStore.getState().openCountrySelector()}>
                                    <span>Regional Adjustment ({selectedCountry.name})</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[var(--accent-brand)] group-hover:underline">Change</span>
                                        <span>×{selectedCountry.taxMultiplier.toFixed(2)}</span>
                                    </div>
                                </div>
                                {selectedCountry.fixedFee > 0 && (
                                    <div className="flex justify-between text-[12px] font-bold text-[var(--text-muted)]">
                                        <span>Logistics Fee</span>
                                        <span>+{selectedCountry.fixedFee} €</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">Total Estimate</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-[var(--text-app)] tabular-nums tracking-tighter">
                                    {Math.round(totalPrice)}
                                </span>
                                <span className="text-xl font-black text-[var(--accent-brand)] uppercase">EUR</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-3">
                            {!verificationResult?.success && !orderSuccess && (
                                <button
                                    disabled={!isComplete || isSubmitting}
                                    onClick={handleGetInquiry}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${isComplete && !isSubmitting
                                        ? 'bg-[var(--accent-brand)] text-white hover:brightness-110 shadow-xl shadow-orange-600/20 active:scale-[0.98]'
                                        : 'bg-[var(--border-app)] text-[var(--text-muted)]/50 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? 'Verifying Price...' : 'Get Official Inquiry'}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            )}

                            {verificationResult?.success && !orderSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-2"
                                >
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                        <p className="text-[12px] font-bold text-emerald-400">
                                            Price Verified: {verificationResult.serverPrice} EUR. Please enter your contact details to submit the official inquiry.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Your Name (Optional)"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-app)] focus:border-[var(--accent-brand)] outline-none transition-all"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Your Email Address *"
                                            required
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            className="w-full bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-app)] focus:border-[var(--accent-brand)] outline-none transition-all"
                                        />
                                        <button
                                            disabled={!customerEmail || isSubmitting}
                                            onClick={handleSubmitOrder}
                                            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${customerEmail && !isSubmitting
                                                ? 'bg-[var(--text-app)] text-[var(--bg-app)] hover:opacity-90'
                                                : 'bg-[var(--border-app)] text-[var(--text-muted)]/50 cursor-not-allowed'
                                                }`}
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                            Submit Official Inquiry
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {orderSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-500 p-6 rounded-2xl text-white text-center shadow-xl shadow-emerald-500/20"
                                >
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
                                    <h4 className="text-lg font-black uppercase tracking-widest mb-2">Inquiry Sent!</h4>
                                    <p className="text-xs font-bold opacity-90 leading-relaxed">
                                        Your configuration has been saved. Our technical team will reach you at <strong>{customerEmail}</strong> shortly.
                                    </p>
                                    <p className="mt-4 text-[10px] uppercase font-black opacity-50">Order ID: {orderSuccess}</p>
                                </motion.div>
                            )}

                            {verificationResult && !verificationResult.success && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl text-[12px] font-bold border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p>{verificationResult.error}</p>
                                </motion.div>
                            )}
                        </div>

                        <button className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-[var(--text-muted)] bg-transparent border-2 border-[var(--border-app)] hover:border-[var(--text-muted)] hover:text-[var(--text-app)] transition-all flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            Download Technical PDF
                        </button>
                    </div>

                    {!isComplete && (
                        <p className="text-[11px] text-center text-[var(--text-muted)] font-bold italic opacity-60">
                            * Selection required for all attributes to finalize pricing.
                        </p>
                    )}
                </div>
            </div>

            {/* Dynamic Background Glow */}
            <div className={`absolute -z-10 -bottom-8 -right-8 w-64 h-64 blur-[120px] rounded-full transition-colors duration-1000 ${theme === 'dark' ? 'bg-rose-600/10' : 'bg-orange-500/20'
                }`} />
        </div>
    );
};
