"use client";

import Image from "next/image";
import PayComponent from "@/components/Pay";
import TokenWallet from "@/components/TokenWallet";
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
        <a
          href="https://edicionesmd.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo-md.png"
            alt="Mundo Didáctico Logo"
            width={100}
            height={100}
            className="mx-auto rounded-full shadow-md hover:scale-105 transition-transform"
            priority
          />
        </a>
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
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {recomendacionDelDia.contenido}
            </p>

            {/* Video de YouTube si existe */}
            {recomendacionDelDia.video ? (
              <div className="overflow-hidden rounded-xl shadow-sm">
                <iframe
                  className="w-full aspect-video rounded-xl"
                  src={recomendacionDelDia.video}
                  title={recomendacionDelDia.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                🎬 Próximamente video relacionado
              </p>
            )}
          </article>
        ) : (
          <p className="text-gray-500 text-sm mb-4">
            No hay recomendación disponible para hoy.
          </p>
        )}

        {/* Bloque de donación y pagos */}
        <div className="border-t border-gray-200 mt-4 pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-[#003A70]">
            Cada día puedes recibir una recomendación financiera acompañada de un video para aprender a manejar mejor tu dinero, 
            fortalecer tus hábitos de inversión e impulsar tu inteligencia financiera. 💡💰📈
          </h4>
          
          <p className="text-sm text-gray-600">
            Agradecemos tu apoyo. Puedes donar en{" "}
            <strong>MD</strong>, <strong>WLD</strong> o <strong>USDC</strong>.
          </p>

          {/* Componente de pagos */}
          <PayComponent />

          <div className="text-xs text-gray-500 break-all">
            Dirección oficial:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {RECEIVER_ADDRESS}
            </code>
          </div>

          {/* Módulo de Billetera Token MD (Lectura y Envíos autónomos) */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <TokenWallet />
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-xs mt-auto pb-4 leading-relaxed">
        {/* Espacio para pie de página si se requiere */}
      </footer>
    </main>
  );
}
