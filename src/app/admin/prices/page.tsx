"use client";

import { DollarSign, Plus, Zap, ShieldCheck, HelpCircle, Edit3, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogicRule {
    id: number;
    trigger: string;
    action: string;
    type: 'Validation' | 'Visibility' | 'Dependency';
    message?: string;
}

const EditRuleModal = ({ rule, onClose }: { rule: LogicRule; onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-[#ea580c] shadow-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Logic Rule</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rule ID: #{rule.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-8 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Rule Type</label>
                            <select defaultValue={rule.type} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none appearance-none">
                                <option>Validation</option>
                                <option>Visibility</option>
                                <option>Dependency</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Trigger Condition</label>
                            <input type="text" defaultValue={rule.trigger} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">System Action</label>
                        <input type="text" defaultValue={rule.action} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Validation Message (Optional)</label>
                        <textarea rows={2} defaultValue={rule.message || "Condition not met."} className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none resize-none" />
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                            Modifying core logic rules may affect existing saved quotes. Ensure technical validation is performed before committing.
                        </p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        Discard
                    </button>
                    <button className="bg-[#ea580c] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3">
                        <Save className="w-4 h-4" />
                        Deploy Rule
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function AdminPrices() {
    const [editingRule, setEditingRule] = useState<LogicRule | null>(null);

    const logicRules: LogicRule[] = [
        { id: 1, trigger: 'Socket Type: UK', action: 'Restrict Count (4, 8)', type: 'Validation', message: 'UK sockets are only available in 4 or 8 units per module.' },
        { id: 2, trigger: 'PDU Subtype: EKO', action: 'Hide Hardware Options', type: 'Visibility' },
        { id: 3, trigger: 'Fan Type: Smart', action: 'Require Smart Controller', type: 'Dependency' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pricing & Logic</h1>
                    <p className="text-slate-500 font-medium mt-1">Industrial engine rules and global pricing multipliers.</p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#ea580c] transition-all flex items-center gap-3 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Add Logic Rule
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Multipliers */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-[#ea580c]" />
                            Global Multipliers
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Universal Markup (%)</label>
                                <div className="relative">
                                    <input type="number" defaultValue="20" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:ring-2 focus:ring-[#ea580c]/10 outline-none" />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Currency Locale</label>
                                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 outline-none appearance-none">
                                    <option>EUR (€) - European</option>
                                    <option>USD ($) - American</option>
                                    <option>GBP (£) - British</option>
                                </select>
                            </div>
                            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ea580c] shadow-lg transition-all active:scale-95">
                                Save Matrix Constants
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#020617] p-10 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/5">
                        <Zap className="absolute -right-8 -top-8 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 group-hover:text-white/10 transition-all duration-700" />
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Logic Intelligence</h3>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">
                            Rules are evaluated in sequential order as documented in the technical datasheet.
                        </p>
                    </div>
                </div>

                {/* Logic Rules Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-[#ea580c]" />
                            Operational Rules
                        </h3>
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-black tracking-widest">v2.4 Active</span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                    <th className="px-10 py-6">Trigger Condition</th>
                                    <th className="px-10 py-6">System Action</th>
                                    <th className="px-10 py-6">Classification</th>
                                    <th className="px-10 py-6 text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                                {logicRules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-10 py-8 text-slate-900 text-base">{rule.trigger}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900">{rule.action}</span>
                                                {rule.message && <span className="text-[10px] text-slate-400 font-bold line-clamp-1">{rule.message}</span>}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${rule.type === 'Validation' ? 'bg-rose-50 text-rose-600' :
                                                    rule.type === 'Visibility' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {rule.type}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                <button
                                                    onClick={() => setEditingRule(rule)}
                                                    className="p-3 text-slate-400 hover:text-[#ea580c] hover:bg-white rounded-xl shadow-sm transition-all"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl shadow-sm transition-all">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 text-center border-t border-slate-50 flex items-center justify-center gap-3">
                        <HelpCircle className="w-4 h-4 text-slate-300" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            Technical validation active for all PDU configurations.
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {editingRule && (
                    <EditRuleModal
                        rule={editingRule}
                        onClose={() => setEditingRule(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
