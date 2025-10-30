"use client";

import React, { useState } from "react";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
  MiniAppPaymentSuccessPayload,
} from "@worldcoin/minikit-js";

export const PayComponent: React.FC = () => {
  const [estado, setEstado] = useState<"idle" | "enviando" | "exito" | "error">("idle");
  const [mensaje, setMensaje] = useState("");

  /** 🧾 Paso 1: Crear referencia de pago y ejecutar MiniKit */
  const enviarPago = async (): Promise<MiniAppPaymentSuccessPayload | null> => {
    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ mantiene la cookie de referencia
      });

      if (!res.ok) throw new Error("Error al crear la referencia de pago.");
      const { id } = await res.json();

      console.log("🪙 [MiniKit] ID de pago generado:", id);

      const payload: PayCommandInput = {
        reference: id,
        to: "0x1bd597c5296b6a25f72ed557d5b85bff41186c28", // dirección de destino
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

      // 🧩 Verificar si MiniKit está disponible
      if (!MiniKit.isInstalled()) {
        setMensaje("⚠️ Abre esta MiniApp desde World App para realizar el pago.");
        setEstado("error");
        return null;
      }

      console.log("✅ [MiniKit] Ejecutando pago...");
      const resultado = await MiniKit.commandsAsync.pay(payload);

      console.log("🎯 [MiniKit] Resultado completo:", resultado);

      // El payload válido viene en result.finalPayload
      return resultado?.finalPayload ?? null;
    } catch (error) {
      console.error("❌ [MiniKit] Error al enviar pago:", error);
      setMensaje("Ocurrió un error al iniciar el pago.");
      setEstado("error");
      return null;
    }
  };

  /** ⚙️ Paso 2: Confirmar pago en backend */
  const manejarPago = async () => {
    setEstado("enviando");
    setMensaje("Procesando pago...");

    try {
      const finalPayload = await enviarPago();

      if (!finalPayload) {
        setMensaje("❌ El pago fue cancelado o no se completó.");
        setEstado("error");
        return;
      }

      console.log("📦 [Front] Payload final recibido:", finalPayload);

      // ✅ Enviar al backend para confirmar la transacción
      const confirmRes = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ payload: finalPayload }),
      });

      const confirmacion = await confirmRes.json();
      console.log("🧾 [Front] Respuesta confirm-payment:", confirmacion);

      if (confirmacion.success) {
        setMensaje("✅ ¡Pago confirmado exitosamente!");
        setEstado("exito");
      } else {
        setMensaje(`❌ Error al confirmar el pago: ${confirmacion.error || "desconocido"}`);
        setEstado("error");
      }
    } catch (error) {
      console.error("💥 [Front] Error general al manejar pago:", error);
      setMensaje("Ocurrió un error inesperado al procesar el pago.");
      setEstado("error");
    }
  };

  /** 🧠 Interfaz de usuario */
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
