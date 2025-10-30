import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
  reference?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, reference: bodyReference } = (await req.json()) as IRequestPayload;

    const cookieStore = cookies();
    const cookieReference = cookieStore.get("payment-nonce")?.value;
    const reference = bodyReference || cookieReference;

    console.log("📦 [confirm-payment] Referencia recibida:", reference);
    console.log("📤 [confirm-payment] Payload recibido:", payload);

    if (!reference) {
      console.warn("⚠️ [confirm-payment] No se encontró referencia ni en cookie ni en body");
      return NextResponse.json({ success: false, error: "No reference found" });
    }

    if (!payload?.transaction_id) {
      console.warn("⚠️ [confirm-payment] Payload inválido o sin transaction_id");
      return NextResponse.json({ success: false, error: "Invalid payload" });
    }

    const appId = process.env.APP_ID;
    const devKey = process.env.DEV_PORTAL_API_KEY;

    if (!appId || !devKey) {
      console.error("❌ [confirm-payment] Faltan APP_ID o DEV_PORTAL_API_KEY");
      return NextResponse.json({ success: false, error: "Server misconfiguration" });
    }

    const apiUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${appId}`;
    console.log("🌐 [confirm-payment] Consultando Worldcoin API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${devKey}` },
    });

    if (!response.ok) {
      console.error("❌ [confirm-payment] Error al consultar Worldcoin API:", response.status);
      return NextResponse.json({ success: false, error: "Worldcoin API error" });
    }

    const transaction = await response.json();
    console.log("💾 [confirm-payment] Transacción consultada:", transaction);

    if (
      transaction.reference === reference &&
      transaction.status === "mined"
    ) {
      console.log("✅ [confirm-payment] Pago confirmado exitosamente");
      return NextResponse.json({ success: true });
    }

    console.warn("⚠️ [confirm-payment] Estado:", transaction.status);
    return NextResponse.json({ success: false, error: transaction.status });
  } catch (error) {
    console.error("💥 [confirm-payment] Error general:", error);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
