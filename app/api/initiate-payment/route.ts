// /app/api/initiate-payment/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const uuid = randomUUID().replace(/-/g, "");

  // Guardar cookie accesible al cliente (para que viaje con el fetch)
  cookies().set({
    name: "payment-nonce",
    value: uuid,
    httpOnly: false, // 🔑 debe ser false para que el cliente la envíe luego
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutos
  });

  console.log("🪙 Cookie 'payment-nonce' guardada:", uuid);

  return NextResponse.json({ id: uuid });
}
