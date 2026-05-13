"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";
import { Menu, X, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/admin") || pathname === "/login") return null;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Building2 size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">Nakshathra Homes</span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ernakulam, Kerala</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            <li><Link href="#rooms" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">Spaces</Link></li>
            <li><Link href="#amenities" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">Amenities</Link></li>
            <li><Link href="#contact" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">Contact</Link></li>
          </ul>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-slate-900 px-3 py-2">
                Admin
              </Link>
            )}
            <Link href="#contact" className="btn btn-cta">
              Book a Visit
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl"
          >
            <div className="p-6 flex flex-col gap-4">
              <Link href="#rooms" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-slate-900">Spaces</Link>
              <Link href="#amenities" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-slate-900">Amenities</Link>
              <Link href="#contact" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-slate-900">Contact</Link>
              <div className="h-px bg-slate-100 my-2" />
              <Link href="#contact" onClick={() => setIsOpen(false)} className="btn btn-cta w-full justify-center">Book a Visit</Link>
              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost w-full justify-center">Admin Dashboard</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
