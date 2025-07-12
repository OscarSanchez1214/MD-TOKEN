"use client";

import Link from "next/link";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import recomendaciones from "@/data/recomendaciones.json";

const hoy = new Date().toISOString().split("T")[0];
const recomendacionDelDia = recomendaciones.find(r => r.fecha === hoy);

const enviarPago = async () => {
  try {
    const res = await fetch(`/api/initiate-payment`, { method: "POST" });
    const { id } = await res.json();

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
      description: "Pago de apoyo al contenido educativo",
    };

    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }

    console.warn("MiniKit no está instalado");
    return null;
  } catch (error) {
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
    } else {
      alert("❌ El pago no se pudo confirmar.");
    }
  } else {
    alert("❌ El pago fue cancelado o falló.");
  }
};

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Recomendación Financiera del Día</h1>

      {recomendacionDelDia ? (
        <article className="mb-10">
          <h2 className="text-xl font-semibold">{recomendacionDelDia.titulo}</h2>
          <p>{recomendacionDelDia.contenido}</p>
        </article>
      ) : (
        <p>No hay recomendación disponible para hoy.</p>
      )}

      <div className="mt-10 flex flex-col gap-4 items-center">
        <button
          onClick={manejarPago}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Enviar Pago
        </button>

        <a
          href="https://edicionesmd.com/publicaciones/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Visita nuestro blog
        </a>

        <a
          href="https://edicionesmd.com/producto/apoyar-al-autor-de-este-blog/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-600 text-white px-5 py-2 rounded hover:bg-amber-700"
        >
          Donar al blog
        </a>
      </div>

      <div className="mt-6 text-center">
        <Link href="/">
          <span className="text-blue-600 hover:underline">← Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
