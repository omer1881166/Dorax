"use client";

import { motion } from "framer-motion";
import { Hammer, Mail, Phone, Globe } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-orange-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Animated Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500" />
          
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Icon Group */}
            <motion.div 
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-[0_0_30px_rgba(234,88,12,0.1)]"
            >
              <Hammer className="w-10 h-10 text-orange-500" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                WE ARE <span className="text-orange-500">UPGRADING</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
                Site geçici olarak kapalıdır. Sizlere daha iyi bir deneyim sunmak için sistemimizi güncelliyoruz.
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-3 bg-white/[0.05] px-4 py-2 rounded-full border border-white/[0.1]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-300 uppercase tracking-widest">System Status: Maintenance</span>
            </div>

            {/* Action/Contact Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
              <a 
                href="mailto:contact@dorax.com" 
                className="flex items-center justify-center space-x-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-2xl p-4 transition-all duration-300 group/link"
              >
                <Mail className="w-5 h-5 text-orange-500 group-hover/link:scale-110 transition-transform" />
                <span className="text-gray-300 font-medium">Bize Ulaşın</span>
              </a>
              <div className="flex items-center justify-center space-x-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-4 opacity-50 cursor-default">
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 font-medium font-mono text-sm uppercase">DORAX V2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Brand */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm font-medium tracking-widest uppercase">
            &copy; {new Date().getFullYear()} DORAX TECHNOLOGIES
          </p>
        </div>
      </motion.div>
    </div>
  );
}
