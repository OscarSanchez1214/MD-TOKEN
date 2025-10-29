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
      to: "0x1bd597c5296b6a25f72ed557d5b85bff41186c28", // Dirección destino
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
      description: "💸 Pago de prueba con World App",
    };

    if (MiniKit.isInstalled()) {
      console.log("✅ MiniKit detectado. Ejecutando pago...");
      return await MiniKit.commandsAsync.pay(payload);
    } else {
      alert("Abre esta MiniApp desde World App para realizar el pago.");
      return null;
    }
  } catch (error: any) {
    console.error("❌ Error al enviar pago:", error);
    alert("Ocurrió un error al procesar el pago.");
    return null;
  }
};

const manejarPago = async () => {
  try {
    const respuestaPago = await enviarPago();
    const resultado = respuestaPago?.finalPayload;

    if (!resultado) {
      alert("❌ El pago fue cancelado o falló.");
      return;
    }

    if (resultado.status === "success") {
      const confirmRes = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: resultado }),
      });

      const confirmacion = await confirmRes.json();

      if (confirmacion.success) {
        alert("✅ ¡Pago realizado con éxito!");
      } else {
        alert("❌ Error al confirmar el pago en el servidor.");
      }
    } else {
      alert("❌ El pago no se completó correctamente.");
    }
  } catch (error) {
    console.error("❌ Error al manejar el pago:", error);
    alert("Ocurrió un error al procesar el pago.");
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
        Apoyar el Canal
      </button>
    </div>
  );
};

// 🚀 EXPORTACIÓN POR DEFECTO (requerida por Next.js y Vercel)
export default PayComponent;
