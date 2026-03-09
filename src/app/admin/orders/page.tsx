"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Inbox,
    Search,
    Filter,
    MoreVertical,
    Mail,
    User,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
    id: string;
    created_at: string;
    customer_email: string;
    customer_name: string;
    total_price: number;
    status: string;
    selections: any;
    quantities: any;
    category_id: string;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        }
    };

    const filteredOrders = orders.filter(o =>
        o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.includes(searchTerm)
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'contacted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Inbox className="w-10 h-10 text-[#ea580c]" />
                        Customer Inquiries
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Manage verified pricing leads and configurations</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#ea580c] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search email, name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-[#ea580c] focus:ring-4 focus:ring-orange-500/5 transition-all w-full md:w-80"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List View */}
                <div className={`${selectedOrder ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-6">Customer</th>
                                        <th className="px-8 py-6">Total Price</th>
                                        <th className="px-8 py-6">Submitted</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={5} className="px-8 py-10">
                                                    <div className="flex items-center gap-4 animate-pulse">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-full" />
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-40 bg-slate-100 rounded" />
                                                            <div className="h-3 w-24 bg-slate-50 rounded" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-24 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Inbox className="w-16 h-16" />
                                                    <p className="font-bold text-slate-500">No inquiries found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <motion.tr
                                                key={order.id}
                                                layoutId={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className={`group cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-orange-50/30' : 'hover:bg-slate-50/80'}`}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-white transition-colors uppercase text-[10px]">
                                                            {order.customer_name?.[0] || order.customer_email[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 tracking-tight">{order.customer_name || 'Anonymous Guest'}</span>
                                                            <span className="text-[11px] font-bold text-slate-400">{order.customer_email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-base font-black text-slate-900">{Math.round(order.total_price)} €</span>
                                                </td>
                                                <td className="px-8 py-6 text-slate-500 text-[11px] font-bold">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                    <br />
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedOrder?.id === order.id ? 'text-[#ea580c]' : 'text-slate-300 group-hover:translate-x-1'}`} />
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Detail View */}
                <AnimatePresence>
                    {selectedOrder && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="lg:col-span-5 space-y-8"
                        >
                            <div className="bg-[#020617] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="absolute right-8 top-8 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>

                                <div className="space-y-8">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Order Detail</span>
                                        <h2 className="text-2xl font-black tracking-tighter">Inquiry v-{selectedOrder.id.slice(0, 8)}</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <User className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Customer</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-lg">{selectedOrder.customer_name || 'N/A'}</p>
                                                <p className="text-xs font-bold text-slate-500">{selectedOrder.customer_email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Submitted</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-lg">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                                <p className="text-xs font-bold text-slate-500">{new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Configuration</span>
                                            <span className="text-2xl font-black text-[#ea580c]">{Math.round(selectedOrder.total_price)} €</span>
                                        </div>

                                        <div className="bg-white/5 rounded-3xl p-6 space-y-4">
                                            {Object.entries(selectedOrder.selections).map(([key, val]) => (
                                                <div key={key} className="flex justify-between items-center text-[11px]">
                                                    <span className="font-black uppercase tracking-widest text-slate-500">{key.replace('pdu_', '')}</span>
                                                    <span className="font-bold text-slate-200">{String(val)}</span>
                                                </div>
                                            ))}
                                            {Object.entries(selectedOrder.quantities).length > 0 && (
                                                <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                                                    {Object.entries(selectedOrder.quantities).map(([key, count]) => (
                                                        <div key={key} className="flex justify-between items-center text-[11px]">
                                                            <span className="font-black uppercase tracking-widest text-[#ea580c]">Module Quant.</span>
                                                            <span className="font-bold text-slate-200">ID: {key.slice(-8)} (x{count as number})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-8 grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => updateStatus(selectedOrder.id, 'contacted')}
                                            className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Mark Contacted
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedOrder.id, 'completed')}
                                            className="py-4 bg-[#ea580c] hover:brightness-110 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Close Order
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={`mailto:${selectedOrder.customer_email}?subject=Official Inquiry Response - Dorax Configuration&body=Dear ${selectedOrder.customer_name || 'Customer'},`}
                                className="block w-full py-6 bg-white border border-slate-200 rounded-[2rem] text-center shadow-sm hover:shadow-xl hover:border-[#ea580c]/20 transition-all font-black uppercase text-xs tracking-[0.2em] text-slate-900 group"
                            >
                                <span className="group-hover:text-[#ea580c] transition-colors flex items-center justify-center gap-3">
                                    <Mail className="w-5 h-5" />
                                    Send Email Response
                                </span>
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
