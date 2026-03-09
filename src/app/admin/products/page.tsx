"use client";

import { Package, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, X, Save, Layers, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Category {
    id: string;
    name: string;
    description: string;
    status?: string;
}

interface Attribute {
    id: string;
    name: string;
}

interface Option {
    id: string;
    attribute_id: string;
    label: string;
    added_cost: number;
    is_in_stock: boolean;
}

const OptionsManagementModal = ({ category, onClose }: { category: Category; onClose: () => void }) => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch attributes for this category
                const { data: attrData } = await supabase
                    .from('attributes')
                    .select('id, name')
                    .eq('category_id', category.id)
                    .order('order_index');

                if (attrData) {
                    setAttributes(attrData);
                    const attrIds = attrData.map((a: Attribute) => a.id);

                    // Fetch options for these attributes
                    const { data: optData } = await supabase
                        .from('options')
                        .select('id, attribute_id, label, added_cost, is_in_stock')
                        .in('attribute_id', attrIds)
                        .order('label');

                    if (optData) setOptions(optData);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [category.id]);

    const updateOption = async (optionId: string, updates: Partial<Option>) => {
        setSaving(optionId);
        try {
            const { error } = await supabase
                .from('options')
                .update(updates)
                .eq('id', optionId);

            if (!error) {
                setOptions(prev => prev.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt));
            }
        } catch (error) {
            console.error('Error updating option:', error);
        } finally {
            setSaving(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#020617]/90 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-[#ea580c] shadow-lg shadow-orange-600/10">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Options Management</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{category.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-10 h-10 text-[#ea580c] animate-spin" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Component Matrix...</span>
                        </div>
                    ) : attributes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
                            <AlertCircle className="w-12 h-12 opacity-20" />
                            <span className="text-sm font-bold">No technical attributes found for this category.</span>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {attributes.map(attr => (
                                <div key={attr.id} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-4 py-2 bg-slate-100 rounded-xl">
                                            {attr.name}
                                        </h3>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {options.filter(o => o.attribute_id === attr.id).map(opt => (
                                            <div key={opt.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4 hover:border-[#ea580c]/30 transition-all">
                                                <div className="flex items-start justify-between gap-3">
                                                    <span className="text-sm font-black text-slate-900 leading-tight">{opt.label}</span>
                                                    <div className={`w-3 h-3 rounded-full ${opt.is_in_stock ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_12px_rgba(16,185,129,0.3)]`}></div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Cost (€)</label>
                                                        <input
                                                            type="number"
                                                            defaultValue={opt.added_cost}
                                                            onBlur={(e) => {
                                                                const newVal = parseFloat(e.target.value);
                                                                if (newVal !== opt.added_cost) updateOption(opt.id, { added_cost: newVal });
                                                            }}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ea580c]/10 outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</label>
                                                        <button
                                                            onClick={() => updateOption(opt.id, { is_in_stock: !opt.is_in_stock })}
                                                            className={`w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${opt.is_in_stock
                                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                                                : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                                                                }`}
                                                        >
                                                            {opt.is_in_stock ? 'In Stock' : 'OOS'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {saving === opt.id && (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#ea580c] uppercase animate-pulse">
                                                        <Save className="w-3 h-3" />
                                                        Saving...
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                    <button onClick={onClose} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-[0.95] transition-all">
                        Close Matrix
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const EditCategoryModal = ({ category, onClose }: { category: Category; onClose: () => void }) => {
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
                        <div className="w-12 h-12 bg-[#ea580c] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                            <Edit2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Category</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{category.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-8 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Internal ID</label>
                            <input type="text" disabled defaultValue={category.id} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-400 font-bold outline-none cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Category Name</label>
                            <input type="text" defaultValue={category.name} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Technical Description</label>
                        <textarea rows={3} defaultValue={category.description} className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Operational Status</label>
                            <select defaultValue={category.status || 'Active'} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-[#ea580c]/10 transition-all outline-none appearance-none">
                                <option>Active</option>
                                <option>Draft</option>
                                <option>Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        Discard
                    </button>
                    <button className="bg-[#ea580c] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3">
                        <Save className="w-4 h-4" />
                        Commit Changes
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function AdminProducts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [managingOptions, setManagingOptions] = useState<Category | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (!error && data) {
                setCategories(data);
            }
            setLoading(false);
        };

        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-slate-500 font-medium mt-1">Industrial data center infrastructure configuration management.</p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#ea580c] transition-all flex items-center gap-3 active:scale-95">
                    <Plus className="w-5 h-5" />
                    New Category
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex flex-col lg:row gap-6 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full lg:w-[450px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Explore technical modules..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#ea580c]/5 focus:border-[#ea580c]/50 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                            <Filter className="w-4 h-4" />
                            Global Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-[#ea580c] animate-spin" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Infrastructure...</span>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                    <th className="px-10 py-6">Industrial Category</th>
                                    <th className="px-10 py-6">Internal ID</th>
                                    <th className="px-10 py-6">System Status</th>
                                    <th className="px-10 py-6 text-right">Matrix Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                                {filteredCategories.map((product) => (
                                    <tr key={product.id} className="hover:bg-[#ea580c]/5 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-slate-100 group-hover:bg-white rounded-[1.25rem] flex items-center justify-center text-slate-400 group-hover:text-[#ea580c] transition-all shadow-sm">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 text-lg font-black tracking-tight">{product.name}</span>
                                                    <span className="text-xs text-slate-400 font-bold line-clamp-1">{product.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
                                                {product.id.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest ${product.status === 'Draft' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {product.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => setManagingOptions(product)}
                                                    className="px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#ea580c] transition-all"
                                                    title="Manage Options"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                    Options Matrix
                                                </button>
                                                <button
                                                    onClick={() => setEditingCategory(product)}
                                                    className="p-3 text-slate-400 hover:text-[#ea580c] hover:bg-white rounded-xl shadow-sm transition-all"
                                                    title="Edit Global Logic"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl shadow-sm transition-all" title="Purge Record">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                                                <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Matrix Registry: {filteredCategories.length} Active Families</span>
                </div>
            </div>

            <AnimatePresence>
                {editingCategory && (
                    <EditCategoryModal
                        category={editingCategory}
                        onClose={() => setEditingCategory(null)}
                    />
                )}
                {managingOptions && (
                    <OptionsManagementModal
                        category={managingOptions}
                        onClose={() => setManagingOptions(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
