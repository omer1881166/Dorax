"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Globe, Plus, Trash2, Save, AlertCircle, Percent, Euro } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Country {
    id: string;
    name: string;
    code: string;
    tax_multiplier: number;
    fixed_fee: number;
    is_default: boolean;
}

export default function RegionalPricingPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Country>>({});

    useEffect(() => {
        fetchCountries();
    }, []);

    async function fetchCountries() {
        setLoading(true);
        const { data, error } = await supabase
            .from('countries')
            .select('*')
            .order('name');

        if (data) setCountries(data);
        setLoading(false);
    }

    async function handleSave() {
        if (!editingId) return;

        const { error } = await supabase
            .from('countries')
            .update({
                name: editForm.name,
                code: editForm.code,
                tax_multiplier: Number(editForm.tax_multiplier),
                fixed_fee: Number(editForm.fixed_fee),
                is_default: editForm.is_default
            })
            .eq('id', editingId);

        if (!error) {
            setEditingId(null);
            fetchCountries();
        }
    }

    async function handleAdd() {
        const { data, error } = await supabase
            .from('countries')
            .insert({
                name: 'New Country',
                code: 'NEW',
                tax_multiplier: 1.0,
                fixed_fee: 0,
                is_default: false
            })
            .select()
            .single();

        if (data) {
            setCountries([...countries, data]);
            startEditing(data);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this country?')) return;
        const { error } = await supabase.from('countries').delete().eq('id', id);
        if (!error) fetchCountries();
    }

    function startEditing(country: Country) {
        setEditingId(country.id);
        setEditForm(country);
    }

    return (
        <div className="space-y-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Globe className="w-10 h-10 text-orange-600" />
                        Regional Pricing
                    </h1>
                    <p className="text-slate-500 font-bold mt-2">Manage country-specific tax multipliers and logistics fees.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-600/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    ADD COUNTRY
                </button>
            </header>

            <div className="grid gap-6">
                {loading ? (
                    <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-200">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Country</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tax Multiplier</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fixed Fee</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {countries.map((country) => (
                                    <tr key={country.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            {editingId === country.id ? (
                                                <input
                                                    className="w-full bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-900">{country.name}</span>
                                                    {country.is_default && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-black rounded-lg uppercase tracking-tight">Default</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {editingId === country.id ? (
                                                <input
                                                    className="w-20 bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-orange-500 uppercase transition-all"
                                                    value={editForm.code}
                                                    maxLength={3}
                                                    onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                                                />
                                            ) : (
                                                <span className="font-black text-slate-400 uppercase text-xs tracking-wider">{country.code}</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {editingId === country.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number" step="0.01"
                                                        className="w-24 bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-900 text-sm text-center focus:ring-2 focus:ring-orange-500 transition-all"
                                                        value={editForm.tax_multiplier}
                                                        onChange={e => setEditForm({ ...editForm, tax_multiplier: Number(e.target.value) })}
                                                    />
                                                    <Percent className="w-4 h-4 text-slate-400" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-slate-900 font-bold">
                                                    {country.tax_multiplier.toFixed(2)}
                                                    <span className="text-[10px] text-slate-400">(+{Math.round((country.tax_multiplier - 1) * 100)}%)</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {editingId === country.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-24 bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-900 text-sm text-center focus:ring-2 focus:ring-orange-500 transition-all"
                                                        value={editForm.fixed_fee}
                                                        onChange={e => setEditForm({ ...editForm, fixed_fee: Number(e.target.value) })}
                                                    />
                                                    <Euro className="w-4 h-4 text-slate-400" />
                                                </div>
                                            ) : (
                                                <div className="text-center font-bold text-slate-900">
                                                    {country.fixed_fee} €
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {editingId === country.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSave}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:brightness-110 transition-all"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        SAVE
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => startEditing(country)}
                                                        className="px-4 py-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-lg transition-all"
                                                    >
                                                        EDIT
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(country.id)}
                                                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="p-8 bg-slate-900 rounded-[32px] text-white flex items-center justify-between shadow-xl shadow-slate-200">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-orange-400 border border-white/5">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">How Regional Pricing Works</h3>
                        <p className="text-slate-400 font-medium text-sm mt-1 max-w-xl">
                            The configurator multiplies the entire build total by the **Tax Multiplier** and then adds the **Fixed Fee**.
                            This allows for instant regional pricing without changing individual product costs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
