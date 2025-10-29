"use client";

import React, { useState } from "react";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";

export const PayComponent: React.FC = () => {
  const [estado, setEstado] = useState<"idle" | "enviando" | "exito" | "error">("idle");
  const [mensaje, setMensaje] = useState("");

  const enviarPago = async (): Promise<any> => {
    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ importante para mantener la cookie
      });

      if (!res.ok) throw new Error("Error al crear la referencia de pago.");

      const { id } = await res.json();
      console.log("🪙 ID de pago generado:", id);

      const payload: PayCommandInput = {
        reference: id,
        to: "0x1bd597c5296b6a25f72ed557d5b85bff41186c28",
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
        setMensaje("⚠️ Abre esta MiniApp desde World App para realizar el pago.");
        setEstado("error");
        return null;
      }
    } catch (error: any) {
      console.error("❌ Error al enviar pago:", error);
      setMensaje("Ocurrió un error al procesar el pago.");
      setEstado("error");
      return null;
    }
  };

  const manejarPago = async () => {
    setEstado("enviando");
    setMensaje("Procesando pago...");

    try {
      const respuestaPago = await enviarPago();
      const resultado = respuestaPago?.finalPayload;

      console.log("🎯 Resultado del pago:", resultado);

      if (!resultado) {
        setMensaje("❌ El pago fue cancelado o falló.");
        setEstado("error");
        return;
      }

      if (resultado.status === "success") {
        const confirmRes = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ para enviar cookie al backend
          body: JSON.stringify({ payload: resultado }),
        });

        const confirmacion = await confirmRes.json();
        console.log("📦 Respuesta del servidor confirm-payment:", confirmacion);

        if (confirmacion.success) {
          setMensaje("✅ ¡Pago realizado con éxito!");
          setEstado("exito");
        } else {
          setMensaje("❌ Error al confirmar el pago en el servidor.");
          setEstado("error");
        }
      } else {
        setMensaje("❌ El pago no se completó correctamente.");
        setEstado("error");
      }
    } catch (error) {
      console.error("❌ Error al manejar el pago:", error);
      setMensaje("Ocurrió un error al procesar el pago.");
      setEstado("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-6 space-y-4">
      <h2 className="text-xl font-bold text-[#003A70]">
        Realizar Pago con World App
      </h2>

      <button
        onClick={manejarPago}
        disabled={estado === "enviando"}
        className={`${
          estado === "enviando"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#013A72] hover:bg-[#0154A0]"
        } text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105`}
      >
        {estado === "enviando" ? "Procesando..." : "Apoyar el Canal"}
      </button>

      {/* 💬 Mensaje visual de estado */}
      {mensaje && (
        <div
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium text-center ${
            estado === "exito"
              ? "bg-green-100 text-green-700"
              : estado === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default PayComponent;
