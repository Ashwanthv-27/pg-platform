"use client";

import { useState } from "react";
import { Send, CheckCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function EnquiryForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    interest_type: "",
    move_in_date: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const phoneNum = form.phone.replace(/\D/g, "");
    if (phoneNum.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          room_type: form.interest_type || undefined,
          message: form.message + (form.move_in_date ? `\n\nPreferred move-in date: ${form.move_in_date}` : ""),
          source: "website",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm looking for a room at Nakshathra Homes")}`;

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 md:p-14 text-center max-w-xl mx-auto"
      >
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-brand-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
        <p className="text-slate-500 mb-8">Thank you for your interest. We will contact you on WhatsApp shortly to confirm availability.</p>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-900 mb-4">Need an immediate response?</p>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp w-full">
            <MessageSquare size={18} /> Chat with us directly
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-emerald-300"></div>
      
      <div className="mb-10 text-center">
        <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Book a Visit</h3>
        <p className="text-slate-500">Leave your details and we'll help you find the perfect space.</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} id="enquiry-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="form-group mb-0 md:col-span-2">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" required />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">WhatsApp Number</label>
            <input className="form-input" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" required />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Move-in Date</label>
            <input className="form-input text-slate-600" type="date" value={form.move_in_date} onChange={(e) => update("move_in_date", e.target.value)} />
          </div>

          <div className="form-group mb-0 md:col-span-2">
            <label className="form-label">What are you looking for?</label>
            <select className="form-input text-slate-600" value={form.interest_type} onChange={(e) => update("interest_type", e.target.value)}>
              <option value="">Any space</option>
              <option value="pg_single">Private Room (PG)</option>
              <option value="pg_sharing">Sharing Bed (PG)</option>
              <option value="1bhk">1 BHK Apartment</option>
              <option value="2bhk">2 BHK Apartment</option>
              <option value="3bhk">3 BHK Apartment</option>
            </select>
          </div>

          <div className="form-group mb-0 md:col-span-2">
            <label className="form-label">Additional Requirements</label>
            <textarea className="form-input" rows={3} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us what you need..." />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button type="submit" className="btn btn-cta w-full py-4 text-[15px]" disabled={submitting}>
            {submitting ? "Sending Request..." : "Submit Enquiry"}
          </button>
          
          {whatsappNumber && (
            <p className="text-sm text-slate-500 font-medium mt-2">
              Prefer to chat? <a href={waLink} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 underline underline-offset-4">Message us on WhatsApp</a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
