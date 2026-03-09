"use client";

import { useEffect, useState } from 'react';
import { Download, X, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already in standalone app
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Force show after 1 second for visibility testing
        const timer = setTimeout(() => {
            setShowPrompt(true);
        }, 1000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If browser hasn't fired event yet, guide user to manual menu
            alert("Browser Setup: Chrome is still preparing the 'Direct Install' engine. \n\nPlease click the Three Dots (⋮) > Save and Share > 'Install Dorax Hub' to open in Standalone Mode now!");
            return;
        }

        // Show the native install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-6"
                >
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl flex items-center justify-between gap-6 overflow-hidden relative">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ea580c]/20 blur-3xl -z-10 rounded-full"></div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#ea580c] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                                <Monitor className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-tight">Dorax Hub Desktop</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Install as a standalone Windows app</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="p-3 text-slate-500 hover:text-white transition-colors"
                                title="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleInstallClick}
                                className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#ea580c] hover:text-white transition-all flex items-center gap-2 shadow-xl active:scale-95"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Install Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
