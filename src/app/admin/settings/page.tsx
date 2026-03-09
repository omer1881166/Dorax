"use client";

import { Settings, Save, Globe, Lock, Cpu, Bell } from 'lucide-react';

export default function AdminSettings() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
                <p className="text-slate-500 font-medium">Global configuration for the technical module builder application.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {/* General Section */}
                <div className="p-8 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        General Branding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 uppercase">Application Name</label>
                            <input type="text" defaultValue="Dorax Technical Module Builder" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 uppercase">Support Email</label>
                            <input type="email" defaultValue="support@dorax.com" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900" />
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="p-8 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Admin Security
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">Two-Factor Authentication</span>
                            <span className="text-xs text-slate-400 font-medium">Require 2FA for all registered admin accounts.</span>
                        </div>
                        <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Section */}
                <div className="p-8 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Engine Settings
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">Live Quote Sync</span>
                            <span className="text-xs text-slate-400 font-medium">Enable real-time price synchronization with server.</span>
                        </div>
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-bold max-w-md">
                        Changes applied here will affect the global customer-facing experience instantly.
                    </p>
                    <button className="bg-[#ea580c] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20 hover:scale-[1.05] transition-all flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
