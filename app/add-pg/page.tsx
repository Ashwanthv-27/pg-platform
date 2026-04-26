"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddPG() {
    const [form, setForm] = useState({
        title: "",
        location: "",
        price: "",
        contact_number: ""
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase
            .from("pg_listings")
            .insert([{
                ...form,
                price: Number(form.price)
            }]);

        if (error) {
            console.error(error);
            alert("Error adding PG");
        } else {
            alert("PG Added!");
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Add PG</h1>

            <form onSubmit={handleSubmit}>
                <input placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <br />

                <input placeholder="Location" onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <br />

                <input placeholder="Price" onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <br />

                <input placeholder="Contact" onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
                <br />

                <button type="submit">Add PG</button>
            </form>
        </div>
    );
}