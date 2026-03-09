"use client";

import { useEffect, useState } from 'react';
import { useConfigStore } from '@/store/useConfigStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronRight } from 'lucide-react';

export default function CountrySelector() {
    const { countries, selectedCountry, setCountry, isLoading } = useConfigStore();
    const [isOpen, setIsOpen] = useState(false);

    // Show modal if no country is selected and data is loaded
    useEffect(() => {
        if (!selectedCountry && countries.length > 0 && !isLoading) {
            setIsOpen(true);
        }
    }, [selectedCountry, countries, isLoading]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative w-full max-auto max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0b] shadow-2xl"
                >
                    <div className="p-8">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-500">
                                <Globe className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Select Region</h2>
                                <p className="text-sm text-gray-400">Please choose your country for accurate pricing and taxes.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {countries.map((country) => (
                                <button
                                    key={country.id}
                                    onClick={() => {
                                        setCountry(country.id);
                                        setIsOpen(false);
                                    }}
                                    className="group relative flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-orange-500/50 hover:bg-orange-500/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 font-bold text-gray-300">
                                            {country.code}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-white">{country.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {country.taxMultiplier > 1 ? `Local taxes included` : `Standard export pricing`}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
                                </button>
                            ))}
                        </div>

                        <p className="mt-8 text-center text-xs text-gray-500">
                            Pricing adjustments are calculated based on regional tax laws and logistics.
                        </p>
                    </div>

                    {/* Bottom accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
