"use client";

import { LayoutGrid, Package, Settings, DollarSign, TrendingUp, History, Activity, Zap, Globe, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
    const [orderCount, setOrderCount] = useState(0);
    const [avgPrice, setAvgPrice] = useState(0);

    useEffect(() => {
        async function fetchStats() {
            const { data, count } = await supabase
                .from('orders')
                .select('*', { count: 'exact' });

            if (count !== null) setOrderCount(count);
            if (data && data.length > 0) {
                const total = data.reduce((sum: number, o: any) => sum + Number(o.total_price), 0);
                setAvgPrice(Math.round(total / data.length));
            }
        }
        fetchStats();
    }, []);

    const stats = [
        { label: 'Active Regions', value: '3', change: 'Live', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Customer Inquiries', value: orderCount.toString(), change: 'New', icon: Inbox, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Technical Models', value: '112', change: '+9', icon: Package, color: 'text-[#ea580c]', bg: 'bg-[#ea580c]/10' },
        { label: 'Avg. Quote Total', value: `${avgPrice} €`, change: '+12%', icon: DollarSign, color: 'text-slate-600', bg: 'bg-slate-100' },
    ];

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Dorax Industrial Engine Matrix v2.0</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Engine Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#ea580c]/20 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <stat.icon size={120} />
                        </div>
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} flex items-center justify-center rounded-[1.25rem] transition-colors`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em] flex items-center gap-3">
                            <History className="w-5 h-5 text-[#ea580c]" />
                            Price Audit Log
                        </h2>
                        <button className="text-[10px] font-black text-[#ea580c] uppercase tracking-widest hover:underline px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">Full Registry</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                    <th className="px-10 py-6">Model Identifier</th>
                                    <th className="px-10 py-6">Variable</th>
                                    <th className="px-10 py-6">Impact</th>
                                    <th className="px-10 py-6">New Value</th>
                                    <th className="px-10 py-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                                <tr className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-10 py-8 text-slate-900">Schuko ON / OFF</td>
                                    <td className="px-10 py-8 text-[11px] uppercase tracking-wider text-slate-400">Added Cost</td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Increased</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 font-black text-base">45.00 €</td>
                                    <td className="px-10 py-8 text-right">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] uppercase font-black tracking-widest">Active</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-10 py-8 text-slate-900">Custom DC PDU</td>
                                    <td className="px-10 py-8 text-[11px] uppercase tracking-wider text-slate-400">Base Price</td>
                                    <td className="px-10 py-8 text-emerald-600">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Increased</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 font-black text-base">150.00 €</td>
                                    <td className="px-10 py-8 text-right">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] uppercase font-black tracking-widest">Active</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-[#020617] p-10 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/5">
                        <Activity className="absolute -right-8 -top-8 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 group-hover:text-white/10 transition-all duration-700" />
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">System Performance</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Engine Load</span>
                                    <span className="text-white">12%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "12%" }} className="h-full bg-[#ea580c]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Database Health</span>
                                    <span className="text-emerald-400">Stable</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Technical Support</h4>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
                            Need adjustments to the core industrial pricing matrix? Contact technical infrastructure support.
                        </p>
                        <button className="w-full py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Open Ticket</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
