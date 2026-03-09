"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { Settings, Package, LayoutGrid, Users, DollarSign, LogOut, ShieldCheck, Globe, Inbox } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session && pathname !== '/admin/login') {
                router.push('/admin/login');
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setSession(session);
            if (!session && pathname !== '/admin/login') {
                router.push('/admin/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [router, pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If not logged in and not on login page, don't show anything (redirect will happen)
    if (!session && pathname !== '/admin/login') {
        return null;
    }

    // If on login page, just show children without layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
        { href: '/admin/orders', label: 'Customer Inquiries', icon: Inbox },
        { href: '/admin/products', label: 'Product Management', icon: Package },
        { href: '/admin/prices', label: 'Pricing Logic', icon: DollarSign },
        { href: '/admin/regional', label: 'Regional Pricing', icon: Globe },
        { href: '/admin/users', label: 'Authorized Admins', icon: Users },
        { href: '/admin/settings', label: 'System Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#f4f6f8]">
            {/* Sidebar */}
            <aside className="w-72 bg-[#020617] text-white p-8 flex flex-col gap-10 shadow-2xl relative z-20">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black tracking-tight text-xl leading-none">DORAX</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Management</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all group ${pathname === item.href
                                ? 'bg-[#ea580c] text-white shadow-lg shadow-orange-600/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${pathname === item.href ? 'text-white' : 'text-slate-500'}`} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-black text-xs">
                            {session?.user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-black text-white truncate">{session?.user?.email?.split('@')[0]}</span>
                            <span className="text-[10px] font-bold text-slate-500 truncate">{session?.user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-auto relative">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
