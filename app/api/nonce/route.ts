import { NextResponse } from "next/server";

export async function GET() {
  // 1. Genera un nonce alfanumérico seguro (mínimo 8 caracteres)
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // 2. Creamos la respuesta JSON
  const response = NextResponse.json({ nonce });

  // 3. Adjuntamos la cookie de manera nativa y segura en la respuesta
  response.cookies.set({
    name: "siwe",
    value: nonce,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
