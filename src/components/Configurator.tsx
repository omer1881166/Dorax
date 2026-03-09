"use client";

import React, { useState } from 'react';
import { useConfigStore } from '@/store/useConfigStore';
import { Settings2, Info, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Configurator: React.FC = () => {
    const {
        categories,
        selectedCategoryId,
        setCategory,
        getSelectedCategory,
        selections,
        setSelection,
        getFilteredOptions,
        getActiveMessages,
        resetSelections,
        quantities,
        setQuantity
    } = useConfigStore();

    const currentCategory = getSelectedCategory();
    const messages = getActiveMessages();

    if (!currentCategory) return null;

    const isPduCategory = selectedCategoryId === '00000000-0000-0000-0000-000000000001' || currentCategory.name.toLowerCase().includes('pdu');
    const pduOrientation = selections['00000000-0000-0000-0000-000000000101'];
    const pduColor = selections['00000000-0000-0000-0000-000000000102'];
    const hasAnySockets = Object.entries(quantities).some(([key, q]) => !key.startsWith('prot_') && !key.startsWith('calc_') && q > 0);
    const socketsConfirmed = selections['_pdu_sockets_confirmed'] === 'true';
    const pduSecurity = selections['00000000-0000-0000-0000-000000000106'];
    const protectionConfirmed = selections['_pdu_protection_confirmed'] === 'true';
    const hasAnyProtection = Object.entries(quantities).some(([key, q]) =>
        currentCategory.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000106')?.options.some(o => o.id === key) && q > 0
    );
    const totalProtectionCount = Object.entries(quantities)
        .filter(([k]) => currentCategory.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000106')?.options.some(o => o.id === k))
        .reduce((sum, [, q]) => sum + (q > 0 ? q : 0), 0);
    const pduEnergyInput = selections['00000000-0000-0000-0000-000000000104'];
    const is3Phase = pduEnergyInput === '925f13b3-0128-4907-a55a-f0e80ad4977d';
    const maxProtection = is3Phase ? 9 : 2;
    const isProtectionOverLimit = totalProtectionCount > maxProtection;

    const calculationConfirmed = selections['_pdu_calculation_confirmed'] === 'true';
    const hasAnyCalculation = Object.entries(quantities).some(([key, q]) =>
        currentCategory.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000107')?.options.some(o => o.id === key) && q > 0
    );
    const totalCalculationCount = Object.entries(quantities)
        .filter(([k]) => currentCategory.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000107')?.options.some(o => o.id === k))
        .reduce((sum, [, q]) => sum + (q > 0 ? q : 0), 0);
    const maxCalculation = 3;
    const isCalculationOverLimit = totalCalculationCount > maxCalculation;

    // Socket limit validation
    const pduCableType = selections['00000000-0000-0000-0000-000000000105'];
    const pduCaseType = selections['pdu_case_type'];
    const pduCaseColor = selections['pdu_case_color'];
    const pduCaseLength = selections['pdu_case_length'];
    const pduCableCrossSection = selections['pdu_cable_cross_section'];
    const cablePropsConfirmed = selections['_pdu_cable_props_confirmed'] === 'true';
    const cablePropsComplete = pduCableType === '00000000-0000-0000-0000-000000000502' ? !!(pduCaseType && pduCaseLength && pduCableCrossSection) : true;

    // 3-Phase Protection Rule: If 3-phase selected, protection count must be 0 or >= 3
    const isProtectionInvalid = is3Phase && totalProtectionCount > 0 && totalProtectionCount < 3;

    // Socket limit validation using specific lookup map
    const pduLimits: Record<string, number> = {
        'Horizontal-19"-Aluminium(1U)': 9,
        'Horizontal-19"-Aluminium(2U)': 18,
        'Horizontal-10"-Aluminium(1U)': 4,
        'Vertical-Aluminium(1U)': 7,
        'Vertical-Aluminium(2U)': 14
    };

    const totalSocketCount = Object.values(quantities).reduce((sum, q) => sum + (q > 0 ? q : 0), 0);
    const maxSockets = pduOrientation ? (pduLimits[pduOrientation] || 8) : 8;
    const isOverLimit = isPduCategory && totalSocketCount > maxSockets;
    const [showLimitPopup, setShowLimitPopup] = useState(false);

    /*  PDU Step Logic (with conditional branching):
        1=orientation, 2=color of PDU, 3=sockets, 4=energy input, 5=cable type,
        6=properties of cable (only if outer_case), 7=protection type  */
    let pduStep = 1;
    if (pduOrientation) pduStep = 2;
    if (pduOrientation && pduColor) pduStep = 3;
    if (pduOrientation && pduColor && socketsConfirmed && hasAnySockets) pduStep = 4;
    if (pduOrientation && pduColor && socketsConfirmed && hasAnySockets && pduEnergyInput) pduStep = 5;
    if (pduOrientation && pduColor && socketsConfirmed && hasAnySockets && pduEnergyInput && pduCableType) {
        if (pduCableType === '00000000-0000-0000-0000-000000000502') {
            pduStep = 6; // Properties Of Cable
            if (cablePropsComplete && cablePropsConfirmed) pduStep = 7; // Protection
        } else {
            pduStep = 7; // Skip properties, go to Protection
        }
    }
    if (pduStep >= 7 && hasAnyProtection && protectionConfirmed) pduStep = 8; // Calculation
    if (pduStep >= 8 && hasAnyCalculation && calculationConfirmed) pduStep = 8; // Calculation is the final step


    const showOrientationSelection = isPduCategory && pduStep === 1;
    const showColorSelection = isPduCategory && pduStep === 2;
    const showSocketSelection = isPduCategory && pduStep === 3;
    const showEnergyInputSelection = isPduCategory && pduStep === 4;
    const showCableTypeSelection = isPduCategory && pduStep === 5;
    const showCablePropertiesSelection = isPduCategory && pduStep === 6;
    const showSecuritySelection = isPduCategory && pduStep === 7 && !protectionConfirmed;
    const showCalculationSelection = isPduCategory && pduStep === 8 && !calculationConfirmed;
    const pduFlowComplete = isPduCategory && pduStep === 8 && hasAnyCalculation && calculationConfirmed && !isCalculationOverLimit;

    // Dynamic step count (7 if Non Cable, 8 if Outer Case)
    const totalSteps = pduCableType === '00000000-0000-0000-0000-000000000501' ? 7 : 8;

    // Find socket attribute by name (Supabase uses UUID IDs, not text IDs)
    const getSocketAttribute = () => {
        return currentCategory.attributes.find(a => a.id === '00000000-0000-0000-0000-000000000103');
    };

    const socketAttribute = getSocketAttribute();
    const socketOptions = socketAttribute?.options.filter(o =>
        !o.label.toLowerCase().includes('vertical') &&
        !o.label.toLowerCase().includes('custom') &&
        !o.label.toLowerCase().includes('eko')
    ) || [];

    // PDU dynamic header
    const getPduTitle = () => {
        if (showOrientationSelection) return 'PDU Configuration';
        if (showColorSelection) return 'Color of PDU';
        if (showSocketSelection) return 'Socket Configuration';
        if (showEnergyInputSelection) return 'Energy Input';
        if (showCableTypeSelection) return 'Cable Type';
        if (showCablePropertiesSelection) return 'Properties Of Cable';
        if (showSecuritySelection) return 'Protection Type';
        if (showCalculationSelection) return 'Calculation';
        return currentCategory.name;
    };

    const getPduSubtitle = () => {
        if (showOrientationSelection) return 'Select specific Aluminium PDU technical format';
        if (showColorSelection) return `${pduOrientation} — Select PDU housing color`;
        if (showSocketSelection) return `${pduOrientation} — Select sockets (Max ${maxSockets})`;
        if (showEnergyInputSelection) return `${pduOrientation} — Choose energy phase or power`;
        if (showCableTypeSelection) return `${pduOrientation} — Select cable or non-cable configuration`;
        if (showCablePropertiesSelection) return `${pduOrientation} — Configure cable properties`;
        if (showSecuritySelection) return `${pduOrientation} — Choose protection types (Max ${maxProtection})`;
        if (showCalculationSelection) return `${pduOrientation} — Choose calculation modules (Max ${maxCalculation})`;
        return currentCategory.description;
    };

    return (
        <div className="flex flex-col gap-10 w-full max-w-2xl">
            {/* Category Tabs */}
            <div className="flex gap-2 p-1.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-app)] shadow-sm">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex-1 py-3 px-5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedCategoryId === cat.id
                            ? 'bg-[var(--accent-brand)] text-white shadow-lg'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--bg-app)]'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="space-y-10">
                <header className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-black text-[var(--text-app)] flex items-center gap-3">
                                <Settings2 className="w-8 h-8 text-[var(--accent-brand)]" />
                                {isPduCategory ? getPduTitle() : currentCategory.name}
                            </h2>
                            <p className="text-[var(--text-muted)] mt-2 font-medium italic">
                                {isPduCategory ? getPduSubtitle() : currentCategory.description}
                            </p>
                        </div>
                        <button
                            onClick={resetSelections}
                            className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-brand)] border border-[var(--border-app)] hover:border-[var(--accent-brand)] rounded-xl transition-all whitespace-nowrap"
                        >
                            Clear Selections
                        </button>
                    </div>

                    {/* PDU Step Indicator & Back Button */}
                    {isPduCategory && pduStep > 1 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (pduStep === 8) {
                                        setSelection('_pdu_calculation_confirmed', '');
                                        setSelection('_pdu_protection_confirmed', '');
                                    } else if (pduStep === 7) {
                                        setSelection('_pdu_protection_confirmed', '');
                                        if (pduCableType === '00000000-0000-0000-0000-000000000502') {
                                            setSelection('_pdu_cable_props_confirmed', '');
                                        } else {
                                            setSelection('00000000-0000-0000-0000-000000000105', '');
                                        }
                                    } else if (pduStep === 6) {
                                        // Back from cable properties to cable type
                                        setSelection('00000000-0000-0000-0000-000000000105', '');
                                        setSelection('pdu_case_type', '');
                                        setSelection('pdu_case_color', '');
                                        setSelection('pdu_case_length', '');
                                        setSelection('pdu_cable_cross_section', '');
                                    } else if (pduStep === 5) {
                                        setSelection('00000000-0000-0000-0000-000000000105', '');
                                        setSelection('00000000-0000-0000-0000-000000000104', '');
                                    } else if (pduStep === 4) {
                                        setSelection('_pdu_sockets_confirmed', '');
                                        setSelection('00000000-0000-0000-0000-000000000104', '');
                                    } else if (pduStep === 3) {
                                        setSelection('00000000-0000-0000-0000-000000000102', '');
                                    } else {
                                        setSelection('00000000-0000-0000-0000-000000000101', '');
                                    }
                                }}
                                className="flex items-center gap-2 text-[11px] font-bold text-[var(--accent-brand)] uppercase tracking-wider hover:opacity-80 transition-opacity"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {pduStep === 8 ? 'Back to Protection' : pduStep === 7 ? (pduCableType === '00000000-0000-0000-0000-000000000502' ? 'Back to Cable Props' : 'Back to Cable Type') : pduStep === 6 ? 'Back to Cable Type' : pduStep === 5 ? 'Back to Energy' : pduStep === 4 ? 'Back to Sockets' : pduStep === 3 ? 'Back to Color' : 'Back to Selection'}
                            </button>
                            <div className="flex items-center gap-2 ml-auto">
                                {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                                    <div key={step} className={`w-8 h-1.5 rounded-full transition-all ${step <= pduStep ? 'bg-[var(--accent-brand)]' : 'bg-[var(--border-app)]'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                <div className="grid gap-10">
                    <AnimatePresence mode="wait">
                        {showOrientationSelection ? (
                            <motion.div
                                key="orientation-selection"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 gap-4"
                            >
                                {getFilteredOptions('00000000-0000-0000-0000-000000000101').map((opt) => (
                                    <button
                                        key={opt.id}
                                        disabled={opt.isInStock === false}
                                        onClick={() => setSelection('00000000-0000-0000-0000-000000000101', opt.id)}
                                        className={`relative group flex items-center justify-between p-7 rounded-2xl border-2 transition-all duration-300 ${pduOrientation === opt.id
                                            ? 'border-[var(--accent-brand)] bg-[var(--accent-brand)]/5 text-[var(--accent-brand)] shadow-lg shadow-orange-500/10'
                                            : opt.isInStock === false
                                                ? 'border-[var(--border-app)] opacity-40 cursor-not-allowed grayscale'
                                                : 'border-[var(--border-app)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--accent-brand)] hover:bg-[var(--bg-app)]'
                                            }`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-black text-lg text-[var(--text-app)] uppercase tracking-tight">{opt.label}</span>
                                            <span className="text-[10px] mt-1 font-black uppercase tracking-widest opacity-60">
                                                {opt.isInStock === false ? 'Out of Stock' : 'Mounting Format'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-[var(--accent-brand)] uppercase tracking-[0.2em]">
                                                {opt.metadata?.max_sockets || 8} Max Sockets
                                            </span>
                                            <ChevronRight className="w-5 h-5 mt-1 text-[var(--border-app)] group-hover:text-[var(--accent-brand)] translate-x-0 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </motion.div>

                            /* ── PDU Step 2: Color of PDU ── */
                        ) : showColorSelection ? (
                            <motion.div
                                key="color-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                    Select PDU Color
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                    {getFilteredOptions('00000000-0000-0000-0000-000000000102').map((opt) => (
                                        <button
                                            key={opt.id}
                                            disabled={opt.isInStock === false}
                                            onClick={() => setSelection('00000000-0000-0000-0000-000000000102', opt.id)}
                                            className={`group relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-500 ${selections['00000000-0000-0000-0000-000000000102'] === opt.id
                                                ? 'bg-white/10 border-[var(--accent-brand)] shadow-xl -translate-y-2'
                                                : opt.isInStock === false
                                                    ? 'opacity-30 cursor-not-allowed grayscale'
                                                    : 'bg-[var(--bg-card)] border-[var(--border-app)] hover:border-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full mb-3 border border-white/10 shadow-lg"
                                                style={{ backgroundColor: opt.metadata?.hex || '#ccc' }}
                                            />
                                            <div className="font-black text-[10px] uppercase tracking-widest text-[var(--text-app)]">
                                                {opt.label}
                                            </div>
                                            {opt.isInStock === false && (
                                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-[8px] font-black text-white uppercase tracking-tighter">OOS</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            /* ── PDU Step 3: Socket Quantities ── */
                        ) : showSocketSelection ? (
                            <motion.div
                                key="socket-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                        Socket Quantity Configuration
                                    </label>
                                    <span className={`text-xs font-black px-3 py-1 rounded-full transition-all ${isOverLimit ? 'bg-red-500/20 text-red-400' : 'bg-[var(--bg-app)] text-[var(--text-muted)]'}`}>
                                        {totalSocketCount} / {maxSockets} sockets
                                    </span>
                                </div>

                                {/* Over-limit warning banner */}
                                <AnimatePresence>
                                    {isOverLimit && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                            <p className="text-sm text-red-300 font-bold">
                                                Maximum {maxSockets} sockets allowed for {pduOrientation} PDU. You have selected {totalSocketCount}.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 gap-4">
                                    {socketOptions.map((opt) => (
                                        <div key={opt.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 bg-[var(--bg-card)] transition-colors ${isOverLimit && (quantities[opt.id] || 0) > 0 ? 'border-red-500/40' : 'border-[var(--border-app)]'}`}>
                                            <div>
                                                <div className="font-bold text-lg text-[var(--text-app)]">{opt.label}</div>
                                                <div className="text-xs text-[var(--text-muted)] font-medium">Added cost: {opt.addedCost} € / pc</div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3 bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-app)]">
                                                    <button
                                                        onClick={() => setQuantity(opt.id, (quantities[opt.id] || 0) - 1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-xl font-bold transition-colors"
                                                    >-</button>
                                                    <span className="w-12 text-center font-black text-lg">{quantities[opt.id] || 0}</span>
                                                    <button
                                                        onClick={() => setQuantity(opt.id, (quantities[opt.id] || 0) + 1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-xl font-bold transition-colors"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Continue Button */}
                                <button
                                    disabled={!hasAnySockets || isOverLimit}
                                    onClick={() => {
                                        if (isOverLimit) {
                                            setShowLimitPopup(true);
                                            return;
                                        }
                                        setSelection('_pdu_sockets_confirmed', 'true');
                                    }}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-4 ${hasAnySockets && !isOverLimit
                                        ? 'bg-[var(--accent-brand)] text-white hover:brightness-110 shadow-xl shadow-orange-600/20 active:scale-[0.98]'
                                        : isOverLimit
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                                            : 'bg-[var(--border-app)] text-[var(--text-muted)]/50 cursor-not-allowed'
                                        }`}
                                >
                                    {isOverLimit ? `⚠ Exceeded by ${totalSocketCount - maxSockets} socket${totalSocketCount - maxSockets > 1 ? 's' : ''}` : 'Continue to Energy Input →'}
                                </button>
                            </motion.div>

                            /* ── PDU Step 3: Energy Input ── */
                        ) : showEnergyInputSelection ? (
                            <motion.div
                                key="energy-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                    Select Energy Input Type
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {getFilteredOptions('00000000-0000-0000-0000-000000000104').map((opt) => (
                                        <button
                                            key={opt.id}
                                            disabled={opt.isInStock === false}
                                            onClick={() => setSelection('00000000-0000-0000-0000-000000000104', opt.id)}
                                            className={`relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 ${selections['00000000-0000-0000-0000-000000000104'] === opt.id
                                                ? 'border-[var(--accent-brand)] bg-[var(--accent-brand)]/5 text-[var(--text-app)]'
                                                : opt.isInStock === false
                                                    ? 'opacity-40 cursor-not-allowed bg-black/5 border-[var(--border-app)]'
                                                    : 'border-[var(--border-app)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                                                }`}
                                        >
                                            <span className="font-black text-center text-sm uppercase tracking-wider">{opt.label}</span>
                                            {opt.isInStock === false && <span className="text-[10px] mt-2 text-red-500 font-bold uppercase">Out of Stock</span>}
                                            {selections['pdu_energy_input'] === opt.id && (
                                                <motion.div
                                                    layoutId="active-stroke-energy"
                                                    className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-brand)]"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            /* ── PDU Step 4: Cable Type ── */
                        ) : showCableTypeSelection ? (
                            <motion.div
                                key="cable-type-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                    Select Cable Configuration
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {getFilteredOptions('00000000-0000-0000-0000-000000000105').map((opt) => (
                                        <button
                                            key={opt.id}
                                            disabled={opt.isInStock === false}
                                            onClick={() => {
                                                setSelection('00000000-0000-0000-0000-000000000105', opt.id);
                                                // Clear cable properties if switching
                                                setSelection('pdu_case_type', '');
                                                setSelection('pdu_case_color', opt.id === '00000000-0000-0000-0000-000000000502' ? 'White' : '');
                                                setSelection('pdu_case_length', '');
                                                setSelection('pdu_cable_cross_section', '');
                                            }}
                                            className={`relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 ${pduCableType === opt.id
                                                ? 'border-[var(--accent-brand)] bg-[var(--accent-brand)]/5 text-[var(--text-app)]'
                                                : opt.isInStock === false
                                                    ? 'opacity-40 cursor-not-allowed border-[var(--border-app)]'
                                                    : 'border-[var(--border-app)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                                                }`}
                                        >
                                            <span className="font-black text-center text-sm uppercase tracking-wider">{opt.label}</span>
                                            <span className="text-[10px] mt-2 font-medium opacity-50 italic">
                                                {opt.id === '00000000-0000-0000-0000-000000000501' ? 'Skip cable properties' : 'Configure cable details'}
                                            </span>
                                            {opt.isInStock === false && <span className="text-[10px] mt-1 text-red-500 font-bold uppercase">Out of Stock</span>}
                                            {pduCableType === opt.id && (
                                                <motion.div
                                                    layoutId="active-stroke-cabletype"
                                                    className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-brand)]"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            /* ── PDU Step 5: Properties Of Cable (only if Outer Case) ── */
                        ) : showCablePropertiesSelection ? (
                            <motion.div
                                key="cable-properties-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                    Configure All Cable Properties
                                </label>
                                <div className="grid grid-cols-1 gap-5">
                                    {/* Type Of Case — Popup Selector */}
                                    <div className="p-5 rounded-2xl border border-[var(--border-app)] bg-[var(--bg-card)]">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 block">Type Of Case</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {['PVC', 'LSZH', 'TEFLON', 'SILICON'].map((caseOpt) => {
                                                const isActive = pduCaseType === caseOpt;
                                                return (
                                                    <button
                                                        key={caseOpt}
                                                        onClick={() => setSelection('pdu_case_type', caseOpt)}
                                                        className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-200 ${isActive
                                                            ? 'border-[var(--accent-brand)] bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]'
                                                            : 'border-[var(--border-app)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                                                            }`}
                                                    >
                                                        {caseOpt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Color — Default White (Read-only) */}
                                    <div className="p-5 rounded-2xl border border-[var(--border-app)] bg-[var(--bg-card)]">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 block">Color</label>
                                        <div className="flex items-center gap-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl px-4 py-3">
                                            <div className="w-5 h-5 rounded-full bg-white border border-gray-300 flex-shrink-0" />
                                            <span className="text-sm font-bold text-[var(--text-app)]">White</span>
                                            <span className="text-[10px] text-[var(--text-muted)] ml-auto uppercase tracking-wider">Default</span>
                                        </div>
                                    </div>
                                    {/* Length — Text Input with meter note */}
                                    <div className="p-5 rounded-2xl border border-[var(--border-app)] bg-[var(--bg-card)]">
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em]">Length</label>
                                            <span className="text-[9px] font-medium text-[var(--accent-brand)] italic">(the order will take in consideration meter style)</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={pduCaseLength || ''}
                                            onChange={(e) => setSelection('pdu_case_length', e.target.value)}
                                            placeholder="Enter length in meters..."
                                            className="w-full bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-app)] placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:border-[var(--accent-brand)] transition-colors"
                                        />
                                    </div>
                                    {/* Cable Cross Section — Popup Selector */}
                                    <div className="p-5 rounded-2xl border border-[var(--border-app)] bg-[var(--bg-card)]">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3 block">Cable Cross Section</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {['3x1,5mm²', '3x2,5mm²', '3x4mm²', '3x6mm²', '5x2,5mm²', '5x4mm²', '5x6mm²'].map((csOpt) => {
                                                const isActive = pduCableCrossSection === csOpt;
                                                return (
                                                    <button
                                                        key={csOpt}
                                                        onClick={() => setSelection('pdu_cable_cross_section', csOpt)}
                                                        className={`py-3 px-3 rounded-xl text-xs font-black tracking-wider border-2 transition-all duration-200 ${isActive
                                                            ? 'border-[var(--accent-brand)] bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]'
                                                            : 'border-[var(--border-app)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                                                            }`}
                                                    >
                                                        {csOpt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Button */}
                                <button
                                    disabled={!cablePropsComplete}
                                    onClick={() => setSelection('_pdu_cable_props_confirmed', 'true')}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-4 ${cablePropsComplete
                                        ? 'bg-[var(--accent-brand)] text-white hover:brightness-110 shadow-xl shadow-orange-600/20 active:scale-[0.98]'
                                        : 'bg-[var(--border-app)] text-[var(--text-muted)]/50 cursor-not-allowed'
                                        }`}
                                >
                                    {cablePropsComplete ? 'Confirm Cable Properties →' : 'Fill all fields to continue'}
                                </button>
                            </motion.div>

                            /* ── PDU Step 7: Protection Type (Multi-Quantity) ── */
                        ) : showSecuritySelection ? (
                            <motion.div
                                key="security-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                        Protection Quantity Configuration
                                    </label>
                                    <span className={`text-xs font-black px-3 py-1 rounded-full transition-all ${isProtectionOverLimit ? 'bg-red-500/20 text-red-400' : 'bg-[var(--bg-app)] text-[var(--text-muted)]'}`}>
                                        {totalProtectionCount} / {maxProtection} modules
                                    </span>
                                </div>

                                {/* Protection over-limit warning banner */}
                                <AnimatePresence>
                                    {isProtectionOverLimit && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                            <p className="text-sm text-red-300 font-bold">
                                                Maximum {maxProtection} protection modules allowed. You have selected {totalProtectionCount}.
                                            </p>
                                        </motion.div>
                                    )}
                                    {isProtectionInvalid && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                                            <p className="text-sm text-orange-300 font-bold">
                                                3-Phase energy input requires either 0 or at least 3 protection modules. Current: {totalProtectionCount}.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 gap-4">
                                    {(getFilteredOptions('00000000-0000-0000-0000-000000000106') || []).map((opt) => (
                                        <div key={opt.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 bg-[var(--bg-card)] border-[var(--border-app)] transition-colors ${opt.isInStock === false ? 'opacity-50 grayscale' : ''}`}>
                                            <div>
                                                <div className="font-bold text-lg text-[var(--text-app)]">{opt.label}</div>
                                                {opt.isInStock === false && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Unavailable</span>}
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3 bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-app)]">
                                                    <button
                                                        onClick={() => setQuantity(opt.id, (quantities[opt.id] || 0) - 1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-xl font-bold transition-colors"
                                                    >-</button>
                                                    <span className="w-12 text-center font-black text-lg">{quantities[opt.id] || 0}</span>
                                                    <button
                                                        disabled={totalProtectionCount >= maxProtection || opt.isInStock === false}
                                                        onClick={() => setQuantity(opt.id, (quantities[opt.id] || 0) + 1)}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold transition-colors ${totalProtectionCount >= maxProtection || opt.isInStock === false ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5'}`}
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Confirm Button */}
                                <button
                                    disabled={isProtectionInvalid || isProtectionOverLimit}
                                    onClick={() => setSelection('_pdu_protection_confirmed', 'true')}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-4 ${!isProtectionInvalid && !isProtectionOverLimit
                                        ? 'bg-[var(--accent-brand)] text-white hover:brightness-110 shadow-xl shadow-orange-600/20 active:scale-[0.98]'
                                        : 'bg-[var(--border-app)] text-[var(--text-muted)]/50 cursor-not-allowed'
                                        }`}
                                >
                                    {isProtectionOverLimit ? `⚠ Limit Exceeded (${totalProtectionCount}/${maxProtection})` : isProtectionInvalid ? `⚠ Selection Required (0 or 3+)` : hasAnyProtection ? 'Confirm Protection Selection →' : 'Confirm Protection Selection (0) →'}
                                </button>
                            </motion.div>

                            /* ── PDU Step 8: Calculation Category (Multi-Quantity) ── */
                        ) : showCalculationSelection ? (
                            <motion.div
                                key="calculation-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                        Calculation Quantity Configuration
                                    </label>
                                    <span className={`text-xs font-black px-3 py-1 rounded-full transition-all ${isCalculationOverLimit ? 'bg-red-500/20 text-red-400' : 'bg-[var(--bg-app)] text-[var(--text-muted)]'}`}>
                                        {totalCalculationCount} / {maxCalculation} modules
                                    </span>
                                </div>

                                {/* Calculation over-limit warning banner */}
                                <AnimatePresence>
                                    {isCalculationOverLimit && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                            <p className="text-sm text-red-300 font-bold">
                                                Maximum {maxCalculation} calculation modules allowed. You have selected {totalCalculationCount}.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 gap-4">
                                    {(getFilteredOptions('00000000-0000-0000-0000-000000000107') || []).map((opt) => (
                                        <div key={opt.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 bg-[var(--bg-card)] border-[var(--border-app)] transition-colors ${opt.isInStock === false ? 'opacity-50 grayscale' : ''}`}>
                                            <div>
                                                <div className="font-bold text-lg text-[var(--text-app)]">{opt.label}</div>
                                                {opt.isInStock === false && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Unavailable</span>}
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3 bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-app)]">
                                                    <button
                                                        onClick={() => setQuantity(opt.id, (quantities[opt.id] || 0) - 1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-xl font-bold transition-colors"
                                                    >-</button>
                                                    <span className="w-12 text-center font-black text-lg">{quantities[opt.id] || 0}</span>
                                                    <button
                                                        disabled={totalCalculationCount >= maxCalculation || opt.isInStock === false}
                                                        onClick={() => setQuantity(opt.id, (quantities[opt.id] || 0) + 1)}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold transition-colors ${totalCalculationCount >= maxCalculation || opt.isInStock === false ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5'}`}
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Confirm Button */}
                                <button
                                    disabled={!hasAnyCalculation || isCalculationOverLimit}
                                    onClick={() => setSelection('_pdu_calculation_confirmed', 'true')}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-4 ${hasAnyCalculation && !isCalculationOverLimit
                                        ? 'bg-[var(--accent-brand)] text-white hover:brightness-110 shadow-xl shadow-orange-600/20 active:scale-[0.98]'
                                        : 'bg-[var(--border-app)] text-[var(--text-muted)]/50 cursor-not-allowed'
                                        }`}
                                >
                                    {isCalculationOverLimit ? `⚠ Limit Exceeded (${totalCalculationCount}/${maxCalculation})` : hasAnyCalculation ? 'Confirm Calculation Selection →' : 'Add at least one calculation type'}
                                </button>
                            </motion.div>

                            /* ── PDU Complete ── */
                        ) : pduFlowComplete ? (
                            <motion.div
                                key="pdu-complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-[var(--accent-brand)]/30 bg-[var(--accent-brand)]/5"
                            >
                                <div className="text-4xl mb-4">✅</div>
                                <h3 className="text-xl font-black text-[var(--text-app)] uppercase tracking-wider">Configuration Complete</h3>
                                <p className="text-sm text-[var(--text-muted)] mt-2 text-center max-w-md">
                                    Your PDU configuration is ready. Review your selections in the Live Quote panel and submit your official inquiry.
                                </p>
                            </motion.div>

                            /* ── Non-PDU: Standard attribute cards ── */
                        ) : (
                            <motion.div
                                key="attribute-config"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid gap-12"
                            >
                                {currentCategory.attributes.map((attr) => {
                                    const filteredOptions = getFilteredOptions(attr.id);
                                    const currentVal = selections[attr.id];

                                    if (filteredOptions.length === 0) return null;

                                    return (
                                        <div key={attr.id} className="space-y-5">
                                            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
                                                {attr.name}
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {filteredOptions.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        disabled={opt.isInStock === false}
                                                        onClick={() => setSelection(attr.id, opt.id)}
                                                        className={`relative group flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 ${currentVal === opt.id
                                                            ? 'border-[var(--accent-brand)] bg-[var(--accent-brand)]/5 text-[var(--text-app)]'
                                                            : opt.isInStock === false
                                                                ? 'opacity-40 cursor-not-allowed grayscale border-[var(--border-app)]'
                                                                : 'border-[var(--border-app)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                                                            }`}
                                                    >
                                                        <span className="font-bold text-base">{opt.label}</span>
                                                        {opt.addedCost !== 0 && (
                                                            <span className={`text-xs mt-1 font-bold ${currentVal === opt.id ? 'text-[var(--accent-brand)]' : 'text-[var(--text-muted)]/60'}`}>
                                                                {opt.addedCost > 0 ? '+' : ''}{opt.addedCost} €
                                                            </span>
                                                        )}
                                                        {opt.isInStock === false && (
                                                            <span className="text-[10px] mt-1 font-black text-red-500 uppercase">Out of Stock</span>
                                                        )}
                                                        {currentVal === opt.id && (
                                                            <motion.div
                                                                layoutId={`active-stroke-${attr.id}`}
                                                                className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-brand)]"
                                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                            />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Messages / Warnings */}
                <AnimatePresence>
                    {messages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-4"
                        >
                            <Info className="w-6 h-6 text-orange-500 shrink-0" />
                            <div className="space-y-1.5">
                                {messages.map((msg, i) => (
                                    <p key={i} className="text-sm text-orange-600 dark:text-orange-200 font-bold leading-snug">{msg}</p>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};
