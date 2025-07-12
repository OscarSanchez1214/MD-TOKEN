"use client";

import Link from "next/link";
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
      to: "0x1bd597c5296b6a25f72ed557d5b85bff41186c28", // Tu dirección
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

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Recomendaciones Financieras</h1>

      <div className="space-y-8">
        <article>
          <h2 className="text-xl font-semibold">1. Crea un fondo de emergencia</h2>
          <p>Destina al menos 3-6 meses de tus gastos mensuales en una cuenta accesible. Te ayudará a afrontar imprevistos sin endeudarte.</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">2. No gastes más de lo que ganas</h2>
          <p>Haz un presupuesto mensual. Prioriza necesidades antes que deseos. Vive por debajo de tus posibilidades para poder ahorrar.</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">3. Invierte a largo plazo</h2>
          <p>Usa instrumentos como fondos indexados o ETF. Cuanto antes empieces, más crecerá tu dinero gracias al interés compuesto.</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">4. Visita nuestro blog</h2>
        </article>
      </div>

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
