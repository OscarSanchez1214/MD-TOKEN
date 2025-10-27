"use client";

import React from "react";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";

const enviarPago = async (): Promise<any> => {
  try {
    const res = await fetch("/api/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error al crear la referencia de pago.");

    const { id } = await res.json();
    console.log("🪙 ID de pago generado:", id);

    const payload: PayCommandInput = {
      reference: id,
      to: "0x1bd597c5296b6a25f72ed557d5b85bff41186c28", // Dirección de destino
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(0.5, Tokens.WLD).toString(),
        },
        {
          symbol: Tokens.USDCE,
          token_amount: tokenToDecimals(0.1, Tokens.USDCE).toString(),
        },
      ],
      description: "💸 Pago de prueba con Worldcoin MiniKit",
    };

    if (MiniKit.isInstalled()) {
      console.log("✅ MiniKit detectado. Ejecutando comando de pago...");
      const result = await MiniKit.commandsAsync.pay(payload);
      return result;
    } else {
      alert("Por favor abre esta MiniApp desde World App para realizar el pago.");
      console.warn("⚠️ MiniKit no está instalado.");
      return null;
    }
  } catch (error: any) {
    console.error("❌ Error al enviar el pago:", error.message || error);
    alert("Hubo un error al procesar el pago.");
    return null;
  }
};

const manejarPago = async () => {
  try {
    if (!MiniKit.isInstalled()) {
      alert("Abre esta MiniApp desde World App para realizar el pago.");
      return;
    }

    const respuestaPago = await enviarPago();

    if (!respuestaPago?.finalPayload) {
      alert("❌ El pago fue cancelado o falló.");
      return;
    }

    const { finalPayload } = respuestaPago;

    if (finalPayload.status === "success") {
      const confirmRes = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload }),
      });

      const confirmacion = await confirmRes.json();

      if (confirmacion.success) {
        alert("✅ ¡Pago realizado con éxito!");
        console.log("💰 Pago confirmado con éxito");
      } else {
        alert("⚠️ El pago no pudo confirmarse en el servidor.");
      }
    } else {
      alert("❌ El pago fue cancelado o falló.");
    }
  } catch (error: any) {
    console.error("❌ Error general:", error.message || error);
    alert("Ocurrió un error inesperado.");
  }
};

export const PayComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-6 space-y-4">
      <h2 className="text-xl font-bold text-[#003A70]">
        Realizar Pago con World App
      </h2>
      <button
        onClick={manejarPago}
        className="bg-[#013A72] hover:bg-[#0154A0] text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105"
      >
        Enviar Pago
      </button>
    </div>
  );
};

// ✅ Exportación por defecto obligatoria para que Next.js pueda importarlo
export default PayComponent;

