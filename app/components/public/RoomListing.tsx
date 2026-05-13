"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Wifi, Zap, Droplet, Car, Tv, ChefHat, Bath, Home } from "lucide-react";

interface Room {
  id: string;
  property_id: string;
  room_number: string | null;
  label: string | null;
  type: string;
  status: string;
  rent_amount: number | null;
  available_from: string | null;
  amenities: string[];
  photos: string[] | null;
}

interface Property {
  id: string;
  name: string;
  whatsapp_number: string | null;
}

export default function RoomListing({ rooms, properties }: { rooms: Room[], properties: Property[] }) {
  const [activeProperty, setActiveProperty] = useState<string>(properties[0]?.id || "all");
  const [filter, setFilter] = useState<string>("all");

  const TYPE_LABELS: Record<string, string> = {
    pg_single: "Private Room", pg_sharing: "Sharing Bed", pg_bed: "PG Bed", pg_room: "PG Room",
    studio: "Studio Flat", "1bhk": "1 BHK Apt", "2bhk": "2 BHK Apt", "3bhk": "3 BHK Apt",
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("wifi") || n.includes("internet")) return <Wifi size={14} />;
    if (n.includes("power") || n.includes("backup") || n.includes("ac")) return <Zap size={14} />;
    if (n.includes("water")) return <Droplet size={14} />;
    if (n.includes("park")) return <Car size={14} />;
    if (n.includes("tv") || n.includes("television")) return <Tv size={14} />;
    if (n.includes("kitchen") || n.includes("cook")) return <ChefHat size={14} />;
    if (n.includes("bath") || n.includes("wash")) return <Bath size={14} />;
    return <Check size={14} />;
  };

  const filteredRooms = rooms.filter(room => {
    if (activeProperty !== "all" && room.property_id !== activeProperty) return false;
    if (filter === "vacant") return room.status === "vacant";
    if (filter === "pg") return room.type.startsWith("pg");
    if (filter === "1bhk") return room.type === "1bhk" || room.type === "studio";
    if (filter === "2bhk") return room.type === "2bhk";
    return true;
  });

  return (
    <div className="w-full">
      {/* Property Tabs */}
      {properties.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide snap-x">
          <button 
            className={`snap-start px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeProperty === "all" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
            onClick={() => setActiveProperty("all")}
          >
            All Locations
          </button>
          {properties.map(p => (
            <button 
              key={p.id}
              className={`snap-start px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeProperty === p.id ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
              onClick={() => setActiveProperty(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
        {[{id: "all", label: "All Spaces"}, {id: "vacant", label: "Available Now"}, {id: "pg", label: "PG Beds"}, {id: "1bhk", label: "1 BHK"}, {id: "2bhk", label: "2 BHK"}].map(f => (
          <button 
            key={f.id}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${filter === f.id ? "bg-brand-100 text-brand-700" : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`} 
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredRooms.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center glass-card"
            >
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No spaces found</h3>
              <p className="text-slate-500">Try adjusting your filters or check another location.</p>
            </motion.div>
          ) : (
            filteredRooms.map(room => {
              const property = properties.find(p => p.id === room.property_id);
              const waNumber = property?.whatsapp_number || "";
              const isOccupied = room.status === "occupied" || room.status === "maintenance";
              const isNotice = room.status === "notice_period";
              const isVacant = room.status === "vacant";

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={room.id} 
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-all duration-500"
                >
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    {room.photos && room.photos.length > 0 ? (
                      <div className="flex h-full overflow-x-auto snap-x scrollbar-hide">
                        {room.photos.map((url, i) => (
                          <img key={i} src={url} alt="Room" className="h-full w-full object-cover snap-start shrink-0" loading="lazy" />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Home size={48} strokeWidth={1} />
                      </div>
                    )}
                    
                    {/* Status Badge Overlaid */}
                    <div className="absolute top-4 left-4">
                      {isVacant && <div className="bg-white/90 backdrop-blur text-brand-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span> Available Now</div>}
                      {isNotice && <div className="bg-white/90 backdrop-blur text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Notice Period</div>}
                      {isOccupied && <div className="bg-white/90 backdrop-blur text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">Occupied</div>}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{property?.name}</div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{room.label || (room.room_number ? `Room ${room.room_number}` : TYPE_LABELS[room.type] || room.type)}</h3>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-extrabold tracking-tight ${isOccupied ? "text-slate-400" : "text-slate-900"}`}>
                          {room.rent_amount ? `₹${room.rent_amount.toLocaleString()}` : "Ask"}
                        </div>
                        <div className="text-xs font-medium text-slate-500">/ month</div>
                      </div>
                    </div>

                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {room.amenities.slice(0, 4).map(a => (
                          <div key={a} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                            {getIcon(a)} {a}
                          </div>
                        ))}
                        {room.amenities.length > 4 && (
                          <div className="flex items-center justify-center px-2 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold border border-slate-100">
                            +{room.amenities.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-5 border-t border-slate-100 flex flex-col gap-3">
                      {isNotice && room.available_from && (
                        <div className="text-xs font-bold text-amber-600 text-center bg-amber-50 rounded-lg py-2">
                          Available from {new Date(room.available_from).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      )}
                      
                      {isVacant ? (
                        <a href="#contact" className="btn btn-cta w-full py-3">Book this space</a>
                      ) : isNotice ? (
                        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${room.label || 'Room ' + room.room_number} (Available ${room.available_from}). Can I register my interest?`)}`} target="_blank" rel="noreferrer" className="btn btn-outline w-full py-3">
                          Register Interest
                        </a>
                      ) : (
                        <button className="btn w-full py-3 bg-slate-100 text-slate-400" disabled>Not Available</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
