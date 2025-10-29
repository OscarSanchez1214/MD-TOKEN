import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload;
    const cookieStore = cookies();
    const reference = cookieStore.get("payment-nonce")?.value;

    console.log("📦 [confirm-payment] Reference guardada:", reference);
    console.log("📤 [confirm-payment] Payload recibido:", payload);

    if (!reference) {
      console.warn("⚠️ [confirm-payment] No se encontró la referencia en cookies");
      return NextResponse.json({ success: false, error: "No reference" });
    }

    if (payload.reference !== reference) {
      console.warn("❌ [confirm-payment] La referencia no coincide");
      return NextResponse.json({ success: false, error: "Reference mismatch" });
    }

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error("❌ [confirm-payment] Error al consultar Worldcoin API");
      return NextResponse.json({ success: false, error: "Worldcoin API error" });
    }

    const transaction = await response.json();
    console.log("💾 [confirm-payment] Transacción consultada:", transaction);

    if (transaction.reference === reference && transaction.status === "mined") {
      console.log("✅ [confirm-payment] Pago confirmado exitosamente");
      return NextResponse.json({ success: true });
    }

    console.warn("⚠️ [confirm-payment] Transacción pendiente o fallida:", transaction.status);
    return NextResponse.json({ success: false, error: transaction.status });
  } catch (error) {
    console.error("💥 [confirm-payment] Error general:", error);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
