import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const uuid = randomUUID().replace(/-/g, "");

    // Guardar cookie temporal (10 minutos)
    cookies().set({
      name: "payment-nonce",
      value: uuid,
      httpOnly: false, // ⚠️ Debe ser false para que el frontend pueda enviarla
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    console.log("🪙 [initiate-payment] Reference generada y guardada:", uuid);

    return NextResponse.json({ id: uuid });
  } catch (error) {
    console.error("💥 [initiate-payment] Error interno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
