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

    console.log("📦 Reference guardada:", reference);
    console.log("📤 Payload recibido:", payload);

    // Si no existe la referencia, error
    if (!reference) {
      console.warn("⚠️ No se encontró la referencia en las cookies");
      return NextResponse.json({ success: false, error: "No reference found" });
    }

    // Verificar coincidencia
    if (payload.reference !== reference) {
      console.warn("❌ La referencia del payload no coincide con la generada");
      return NextResponse.json({ success: false, error: "Reference mismatch" });
    }

    // Consultar el estado real de la transacción
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
      console.error("❌ Error al consultar la API de Worldcoin");
      return NextResponse.json({ success: false, error: "Worldcoin API error" });
    }

    const transaction = await response.json();
    console.log("💾 Transacción consultada:", transaction);

    // Confirmar éxito si todo coincide y no falló
    if (transaction.reference === reference && transaction.status !== "failed") {
      console.log("✅ Pago confirmado exitosamente");
      return NextResponse.json({ success: true });
    }

    console.warn("⚠️ La transacción no fue exitosa:", transaction.status);
    return NextResponse.json({ success: false, error: "Transaction failed" });
  } catch (error) {
    console.error("💥 Error en confirm-payment:", error);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
