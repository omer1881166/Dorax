"use client";

import { Users, Plus, Shield, Mail, Key, MoreHorizontal, UserCheck } from 'lucide-react';

export default function AdminUsers() {
    const admins = [
        { id: 1, name: 'Admin User', email: 'admin@dorax.com', role: 'Super Admin', status: 'Active' },
        { id: 2, name: 'Sales Manager', email: 'sales@dorax.com', role: 'Editor', status: 'Active' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Authorized Admins</h1>
                    <p className="text-slate-500 font-medium">Manage who can access and edit the product configurator settings.</p>
                </div>
                <button className="bg-[#ea580c] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Invite New Admin
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">User Account</th>
                                <th className="px-8 py-5">Access Level</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                            {admins.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-black">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900">{user.name}</span>
                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Shield className={`w-4 h-4 ${user.role === 'Super Admin' ? 'text-[#ea580c]' : 'text-slate-400'}`} />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                                            <UserCheck className="w-3 h-3" />
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button className="p-2 hover:text-[#ea580c] transition-colors"><Key className="w-4 h-4" /></button>
                                            <button className="p-2 hover:text-slate-600 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
