"use client";

import Image from "next/image";
import PayComponent from "@/components/Pay";
import recomendaciones from "@/data/recomendaciones.json";

// Dirección oficial de recepción de donaciones
const RECEIVER_ADDRESS = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";
const hoy = new Date().toISOString().split("T")[0];
const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy);

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start 
                 bg-gradient-to-b from-blue-50 to-white px-4 py-8 text-gray-800 relative"
      style={{
        backgroundImage: "url('/fondo-md.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Logo y encabezado */}
      <div className="mt-6 mb-8 text-center">
        <Image
          src="/logo.png" // asegúrate que esté en /public/logo.png
          alt="Logo MD"
          width={100}
          height={100}
          className="mx-auto rounded-full shadow-md"
        />
        <h1 className="mt-4 text-2xl font-bold text-[#003A70]">
          MUNDO DIDÁCTICO
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Educación Emocional y Financiera
        </p>
      </div>

      {/* Tarjeta principal */}
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-6 mb-8 text-center backdrop-blur-sm">
        {/* Bloque de recomendación */}
        <h2 className="text-xl font-semibold text-[#003A70] mb-2">
          Recomendación del Día 💡
        </h2>
        {recomendacionDelDia ? (
          <article className="bg-gray-50 p-4 rounded-xl shadow-sm mb-4">
            <h3 className="font-semibold text-[#003A70] mb-1">
              {recomendacionDelDia.titulo}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recomendacionDelDia.contenido}
            </p>
          </article>
        ) : (
          <p className="text-gray-500 text-sm mb-4">
            No hay recomendación disponible para hoy.
          </p>
        )}

        {/* Bloque de donación */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <h3 className="text-lg font-semibold text-[#003A70] mb-3">
            Enviar Donación 💙
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Agradecemos tu apoyo. Puedes donar en{" "}
            <strong>MD</strong>, <strong>WLD</strong> o <strong>USDC</strong>.
          </p>

          <PayComponent />

          <div className="mt-4 text-xs text-gray-500 break-all">
            Dirección oficial:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {RECEIVER_ADDRESS}
            </code>
          </div>
        </div>
      </div>

      {/* Footer con info técnica */}
      <footer className="text-center text-gray-500 text-xs mt-auto pb-4 leading-relaxed">
        Tokens soportados:<br />
        💠 MD – 0x6335c1F2967A85e98cCc89dA0c87e672715284dB<br />
        🌐 WLD – 0x2cFc85d8E48F8EAB294be644d9E25C3030863003<br />
        💵 USDC – 0x79A02482A880bCE3F13e09Da970dC34db4CD24d1
      </footer>
    </main>
  );
}
