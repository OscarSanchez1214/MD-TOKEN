"use client";

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";

const enviarPago = async () => {
  try {
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
    });

    const { id } = await res.json();
    console.log("ID de pago:", id);

    const payload: PayCommandInput = {
      reference: id,
      to: "0x1bd597c5296b6a25f72ed557d5b85bff41186c28", // Dirección de prueba
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
      description: "Este es un pago de prueba",
    };

    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }

    console.warn("MiniKit no está instalado");
    return null;
  } catch (error: unknown) {
    console.error("Error al enviar el pago:", error);
    return null;
  }
};

const manejarPago = async () => {
  if (!MiniKit.isInstalled()) {
    alert("Abre esta MiniApp desde World App para realizar el pago.");
    return;
  }

  const respuestaPago = await enviarPago();
  const resultado = respuestaPago?.finalPayload;

  if (!resultado) return;

  if (resultado.status === "success") {
    const res = await fetch(`/api/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: resultado }),
    });

    const confirmacion = await res.json();

    if (confirmacion.success) {
      alert("✅ ¡Pago realizado con éxito!");
      console.log("Pago exitoso");
    } else {
      alert("❌ El pago no se pudo confirmar.");
      console.log("Fallo en la confirmación");
    }
  } else {
    alert("❌ El pago fue cancelado o falló.");
  }
};

export const PayBlock = () => {
  return (
    <div className="flex flex-col items-center mt-6">
      <h2 className="text-xl font-bold mb-2">Realizar Pago</h2>
      <button
        onClick={manejarPago}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar Pago
      </button>
    </div>
  );
};
