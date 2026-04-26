"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PG = {
  id: string;
  title: string;
  location: string;
  price: number;
  contact_number: string;
};

export default function Home() {
  const [pgs, setPgs] = useState<PG[]>([]);

  useEffect(() => {
    fetchPGs();
  }, []);

  async function fetchPGs() {
    const { data, error } = await supabase
      .from("pg_listings")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setPgs(data as PG[]);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>PG Listings</h1>

      {pgs.map((pg) => (
        <div key={pg.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h2>{pg.title}</h2>
          <p>{pg.location}</p>
          <p>₹{pg.price}</p>

          <a href={`https://wa.me/91${pg.contact_number}`}>
            Contact on WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}