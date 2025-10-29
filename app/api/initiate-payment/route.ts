import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const uuid = randomUUID().replace(/-/g, "");

    cookies().set({
      name: "payment-nonce",
      value: uuid,
      httpOnly: false, // ✅ Debe ser false para que viaje al hacer fetch
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 min
    });

    console.log("🪙 [initiate-payment] Cookie 'payment-nonce' guardada:", uuid);

    return NextResponse.json({ id: uuid });
  } catch (error) {
    console.error("❌ [initiate-payment] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
