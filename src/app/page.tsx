"use client";

import { Configurator } from '@/components/Configurator'
import { PriceSummary } from '@/components/PriceSummary'
import { Sun, Moon } from 'lucide-react'
import { useConfigStore } from '@/store/useConfigStore'
import { useEffect, useState } from 'react'

const DoraxLogo = () => (
  <div className="flex items-center group cursor-default select-none">
    <img
      src="/logodorax.png"
      alt="Dorax Logo"
      className="h-12 w-auto object-contain sm:h-14 transition-transform duration-300 group-hover:scale-[1.02]"
    />
  </div>
)

export default function Home() {
  const { theme, toggleTheme, fetchData, isLoading, categories } = useConfigStore()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch and trigger fetch
  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!mounted) return
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme, mounted])

  if (!mounted) return null

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] text-[var(--text-app)] selection:bg-[#ea580c] selection:text-white transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-[var(--border-app)] bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <DoraxLogo />

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl border border-[var(--border-app)] bg-[var(--bg-app)] text-[var(--text-app)] hover:border-[#ea580c] hover:text-[#ea580c] transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="hidden sm:block px-6 py-2.5 bg-[#ea580c] text-white rounded-xl font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all">
              Client Portal
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-[var(--accent-brand)] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-[var(--text-muted)] uppercase tracking-widest text-xs animate-pulse">
              Initializing Engine Matrix...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <h2 className="text-2xl font-black mb-2 uppercase italic text-[var(--accent-brand)]">No Configuration Data</h2>
            <p className="text-[var(--text-muted)] font-bold">Please check your database connection or seed initial data.</p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
                <span>Corporate</span>
                <span>/</span>
                <span className="text-[#ea580c]">Product Configurator</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[var(--text-app)] tracking-tight mb-4 leading-tight">
                Technical <span className="text-[#ea580c]">Module Builder</span>
              </h1>
              <p className="max-w-2xl text-lg text-[var(--text-muted)] font-medium leading-relaxed">
                Construct and quote custom data center infrastructure components.
                Select a category below to begin your technical validation.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1 w-full">
                <Configurator />
              </div>
              <div className="sticky top-28 w-full lg:w-auto">
                <PriceSummary />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="mt-24 py-12 border-t border-[var(--border-app)] bg-[var(--bg-card)]/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="grayscale opacity-50 contrast-125 scale-75 origin-left">
            <DoraxLogo />
          </div>
          <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider text-center md:text-right">
            © {new Date().getFullYear()} Dorax Systems Industrial Solutions.<br />
            Data Center Infrastructure Experts.
          </p>
        </div>
      </footer>
    </div>
  )
}
