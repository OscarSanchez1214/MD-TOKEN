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
      return NextResponse.json({ success: false, error: "No reference found" });
    }

    if (!payload || !payload.reference || !payload.transaction_id) {
      console.warn("⚠️ [confirm-payment] Payload incompleto o inválido");
      return NextResponse.json({ success: false, error: "Invalid payload" });
    }

    if (payload.reference !== reference) {
      console.warn("❌ [confirm-payment] La referencia no coincide");
      return NextResponse.json({ success: false, error: "Reference mismatch" });
    }

    // ✅ Validación de variables de entorno
    const appId = process.env.APP_ID;
    const devKey = process.env.DEV_PORTAL_API_KEY;

    if (!appId || !devKey) {
      console.error("❌ [confirm-payment] APP_ID o DEV_PORTAL_API_KEY no configurados");
      return NextResponse.json({ success: false, error: "Server misconfiguration" });
    }

    const apiUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${appId}`;
    console.log("🌐 [confirm-payment] Consultando API de Worldcoin:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${devKey}`,
      },
    });

    if (!response.ok) {
      console.error("❌ [confirm-payment] Error al consultar Worldcoin API:", response.status);
      return NextResponse.json({ success: false, error: "Worldcoin API error" });
    }

    const transaction = await response.json();
    console.log("💾 [confirm-payment] Transacción consultada:", transaction);

    if (transaction.reference === reference && transaction.status === "mined") {
      console.log("✅ [confirm-payment] Pago confirmado exitosamente");
      return NextResponse.json({ success: true });
    }

    console.warn(
      "⚠️ [confirm-payment] Transacción pendiente o fallida:",
      transaction.status
    );
    return NextResponse.json({
      success: false,
      error: transaction.status || "unknown_status",
    });
  } catch (error) {
    console.error("💥 [confirm-payment] Error general:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
