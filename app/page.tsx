import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ArrowRight, ShieldCheck, MapPin, Star } from "lucide-react";
import EnquiryForm from "@/app/components/public/EnquiryForm";
import RoomListing from "@/app/components/public/RoomListing";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import * as motion from "framer-motion/client";

export const metadata: Metadata = {
  title: "Premium PG & Apartments in Ernakulam | Nakshathra Homes",
  description: "Experience luxury living with our fully furnished PG accommodations and flats in Ernakulam. Zero brokerage, modern amenities, and prime locations.",
};

async function getPublicData() {
  const supabase = await createSupabaseServerClient();
  
  const [propertiesRes, roomsRes] = await Promise.all([
    supabase.from("properties").select("id, name, whatsapp_number, type, google_maps_url").eq("is_published", true).order("display_order"),
    supabase.from("rooms").select("*").eq("is_visible", true).order("display_order"),
  ]);

  return {
    properties: propertiesRes.data ?? [],
    rooms: roomsRes.data ?? [],
  };
}

export default async function HomePage() {
  const { properties, rooms } = await getPublicData();

  const totalVacant = rooms.filter(r => r.status === "vacant").length;
  const totalRooms = rooms.length;
  
  const vacantRooms = rooms.filter(r => r.status === "vacant");
  const minRent = vacantRooms.length > 0 ? Math.min(...vacantRooms.map(r => r.rent_amount || Infinity)) : 0;

  const primaryPhone = properties[0]?.whatsapp_number || "";
  const waLink = primaryPhone ? `https://wa.me/${primaryPhone}?text=${encodeURIComponent("Hi, I'm looking for a room at Nakshathra Homes")}` : "#";

  return (
    <div className="overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/40 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/30 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-sm font-semibold text-slate-700 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              {totalVacant} Spaces Available Now
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Elevate your living experience in <span className="text-gradient">Ernakulam</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
          >
            Discover beautifully designed PG accommodations and private apartments. Fully furnished, zero brokerage, and ready for you to move in.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#rooms" className="btn btn-cta btn-lg w-full sm:w-auto rounded-full px-8 shadow-xl shadow-slate-900/20">
              Explore Spaces <ArrowRight size={18} />
            </Link>
            {primaryPhone && (
              <a href={waLink} target="_blank" rel="noreferrer" className="btn bg-white text-slate-900 border border-slate-200 shadow-lg shadow-slate-200/50 hover:bg-slate-50 hover:border-slate-300 btn-lg w-full sm:w-auto rounded-full px-8">
                <MessageSquare size={18} className="text-[#25D366]" /> Chat with us
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <section className="px-6 pb-24 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="glass-card p-8 md:col-span-2 bg-gradient-to-br from-brand-600 to-emerald-800 text-white border-none relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <ShieldCheck size={32} className="mb-6 opacity-80" />
              <div className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">Starting from</div>
              <div className="text-5xl font-bold tracking-tight mb-4">
                {minRent > 0 && minRent !== Infinity ? `₹${minRent.toLocaleString()}` : "Premium"}
              </div>
              <p className="text-emerald-100 font-medium max-w-sm">No hidden fees, no brokerage. Transparent pricing with just 2 months deposit policy.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-8 flex flex-col justify-between"
          >
            <MapPin size={28} className="text-brand-500 mb-6" />
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{properties.length}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Prime Locations</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 flex flex-col justify-between"
          >
            <Star size={28} className="text-amber-500 mb-6" />
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{totalRooms}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Rooms</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 md:col-span-2 bg-slate-900 text-white border-none flex items-center justify-between overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to move in?</h3>
              <p className="text-slate-400 font-medium">{totalVacant} spaces are currently vacant and waiting for you.</p>
            </div>
            <Link href="#rooms" className="relative z-10 hidden sm:flex w-16 h-16 bg-white text-slate-900 rounded-full items-center justify-center hover:scale-105 transition-transform shadow-xl">
              <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Room Listing Section */}
      <section id="rooms" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Find your perfect space</h2>
            <p className="text-lg text-slate-500 max-w-2xl font-medium">Browse our curated collection of premium living spaces across Ernakulam.</p>
          </motion.div>
          
          <RoomListing rooms={rooms as any} properties={properties} />
        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="contact" className="py-32 px-6 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <EnquiryForm whatsappNumber={primaryPhone} />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-brand-500/20">
            <ShieldCheck size={24} />
          </div>
          <div className="font-bold text-2xl text-slate-900 tracking-tight mb-2">Nakshathra Homes</div>
          <div className="text-slate-500 font-medium mb-10">Premium Living in Ernakulam, Kerala</div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-16">
            <Link href="#rooms" className="text-sm font-bold text-slate-600 hover:text-brand-600 uppercase tracking-wider">Spaces</Link>
            {properties.find(p => (p as any).google_maps_url) && (
              <a href={(properties.find(p => (p as any).google_maps_url) as any).google_maps_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-600 hover:text-brand-600 uppercase tracking-wider">
                Google Maps
              </a>
            )}
            {primaryPhone && <a href={waLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-600 hover:text-brand-600 uppercase tracking-wider">WhatsApp</a>}
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400 font-medium">
            <div>&copy; {new Date().getFullYear()} Nakshathra Homes. All rights reserved.</div>
            <Link href="/admin" className="hover:text-slate-600 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp phoneNumber={primaryPhone} />
    </div>
  );
}
