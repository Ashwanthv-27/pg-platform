import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Valid phone number required"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
  property_id: z.string().uuid().optional().or(z.literal("")),
  room_type: z.string().optional(),
  budget: z.number().positive().optional(),
  source: z.enum(["website", "whatsapp", "google", "referral", "other"]).default("website"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("leads").insert({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message || null,
      property_id: data.property_id || null,
      room_type: data.room_type || null,
      budget: data.budget || null,
      source: data.source,
      status: "new",
    });

    if (error) {
      console.error("Lead insert error:", error);
      return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
