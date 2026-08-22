import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function GET() {
  // Genera un nonce alfanumérico seguro de al menos 8 caracteres
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Guardamos el nonce en una cookie HTTP-only para validarlo después
  cookies().set("siwe", nonce, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  });

  return NextResponse.json({ nonce });
}
