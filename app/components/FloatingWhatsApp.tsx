"use client";

import { MessageSquare } from "lucide-react";

interface Props {
  phoneNumber: string;
}

export default function FloatingWhatsApp({ phoneNumber }: Props) {
  if (!phoneNumber) return null;

  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent("Hi, I'm looking for a room at Nakshathra Homes")}`;

  return (
    <div className="fixed bottom-6 inset-x-6 md:hidden z-50">
      <div className="glass-card p-2 shadow-2xl shadow-[#25D366]/20">
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp w-full flex items-center justify-center py-3 text-[15px]">
          <MessageSquare size={20} />
          Chat with us on WhatsApp
        </a>
      </div>
    </div>
  );
}
