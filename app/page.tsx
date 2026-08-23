"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PayComponent from "@/components/Pay";
import recomendaciones from "@/data/recomendaciones.json";

const RECEIVER_ADDRESS = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";

export default function Home() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const hoy = new Date().toISOString().split("T")[0];
  const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy);

  const handleGoToDashboard = () => {
    setIsNavigating(true);
    router.push("/dashboard");
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-blue-50 to-white px-4 py-6 text-gray-800 relative"
      style={{
        backgroundImage: "url('/fondo-md.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full flex flex-col items-center flex-1">
        
        {/* Encabezado */}
        <div className="mt-4 mb-6 text-center">
          <a href="https://edicionesmd.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/logo-md.png"
              alt="Mundo Didáctico Logo"
              width={90}
              height={90}
              className="mx-auto rounded-full shadow-md hover:scale-105 transition-transform"
              priority
            />
          </a>
          <h1 className="mt-3 text-2xl font-bold text-[#003A70]">MUNDO DIDÁCTICO</h1>
          <p className="text-gray-600 text-xs mt-0.5">Educación Emocional y Financiera</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="w-full max-w-sm bg-white/95 rounded-3xl shadow-lg p-5 mb-6 text-center backdrop-blur-sm space-y-5">
          <div className="space-y-5">
            
            {/* Recomendación del Día */}
            <div>
              <h2 className="text-lg font-bold text-[#003A70] mb-2">Recomendación del Día 💡</h2>
              {recomendacionDelDia ? (
                <article className="bg-gray-50 p-3.5 rounded-2xl shadow-sm text-left border border-gray-100">
                  <h3 className="font-semibold text-sm text-[#003A70] mb-1">{recomendacionDelDia.titulo}</h3>
                  <p className="text-xs text-gray-700 leading-relaxed mb-3">{recomendacionDelDia.contenido}</p>
                  {recomendacionDelDia.video && (
                    <div className="overflow-hidden rounded-xl shadow-sm">
                      <iframe
                        className="w-full aspect-video rounded-xl"
                        src={recomendacionDelDia.video}
                        title={recomendacionDelDia.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </article>
              ) : (
                <p className="text-gray-500 text-xs">No hay recomendación disponible para hoy.</p>
              )}
            </div>

            {/* Pagos / Donaciones */}
            <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
              <h4 className="text-[11px] font-medium text-gray-600 leading-relaxed">
                Aprende a manejar mejor tu dinero, fortalecer tus hábitos e impulsar tu inteligencia financiera. 💡💰📈
              </h4>
              <PayComponent />
              <div className="text-[10px] text-gray-400 break-all">
                Dirección oficial: <code className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 font-mono">{RECEIVER_ADDRESS}</code>
              </div>
            </div>

            {/* Botón de Acceso directo al Dashboard */}
            <div className="pt-2">
              <button
                onClick={handleGoToDashboard}
                disabled={isNavigating}
                className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-sm flex justify-center items-center gap-2"
              >
                {isNavigating ? 'Cargando...' : 'IR A DASHBOARD'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <footer className="text-center text-gray-400 text-[10px] pb-2">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
