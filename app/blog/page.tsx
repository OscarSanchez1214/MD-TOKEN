"use client";

import Link from "next/link";
import PayComponent from "@/components/Pay";
import recomendaciones from "@/data/recomendaciones.json";

const hoy = new Date().toISOString().split("T")[0];
const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy);

// Dirección del destinatario oficial de pagos MD
const RECEIVER_ADDRESS = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Título principal */}
      <h1 className="text-3xl font-bold mb-6 text-center text-[#003A70]">
        Recomendación Financiera del Día
      </h1>

      {/* Contenido dinámico */}
      {recomendacionDelDia ? (
        <article className="mb-10 border rounded-lg p-5 shadow-sm bg-white">
          <h2 className="text-xl font-semibold text-[#003A70] mb-2">
            {recomendacionDelDia.titulo}
          </h2>
          <p className="text-gray-700">{recomendacionDelDia.contenido}</p>
        </article>
      ) : (
        <p className="text-gray-500 text-center">
          No hay recomendación disponible para hoy.
        </p>
      )}

      {/* Bloque de pago */}
      <div className="my-10 border-t pt-8">
        <h3 className="text-2xl font-semibold mb-4 text-center text-[#003A70]">
          Apoya este contenido con Tokens MD 💙
        </h3>
        <p className="text-center text-gray-600 mb-4">
          Puedes escanear un código QR o ingresar la dirección manualmente.
        </p>

        {/* Componente QR + envío */}
        <div className="flex justify-center">
          <PayComponent />
        </div>

        {/* Dirección destino visible (opcional) */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Dirección de destino:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
            {RECEIVER_ADDRESS}
          </code>
        </div>
      </div>

      {/* Enlaces adicionales (botón de visitar eliminado) */}
      <div className="mt-10 flex flex-col gap-4 items-center">
        <Link href="/">
          <span className="text-blue-600 hover:underline">← Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}





