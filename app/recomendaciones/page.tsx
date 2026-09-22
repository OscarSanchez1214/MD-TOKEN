"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import PayComponent from "@/components/Pay";
import recomendaciones from "@/data/recomendaciones.json";

export default function RecomendacionesPage() {
  const hoy = new Date().toISOString().split("T")[0];
  const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy) || recomendaciones[0];

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-6 text-gray-800 bg-cover bg-center" style={{ backgroundImage: "url('/fondo-md.jpg')" }}>
      <div className="w-full flex flex-col items-center max-w-sm">
        
        {/* Encabezado */}
        <div className="mt-2 mb-4 text-center">
          <Image src="/logo-md.png" alt="Logo" width={70} height={70} className="mx-auto rounded-full bg-white/80 p-1 shadow" />
          <h1 className="mt-2 text-xl font-bold text-[#003A70]">MUNDO DIDÁCTICO</h1>
          <p className="text-xs text-gray-600">Nuestro Canal & Recomendaciones</p>
        </div>

        {/* Contenido Principal */}
        <div className="w-full bg-white/95 rounded-3xl shadow-lg p-5 mb-4 border border-white/50 space-y-4">
          <h2 className="text-sm font-bold text-[#003A70]">Recomendación del Día 💡</h2>
          
          {recomendacionDelDia && (
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-left space-y-2">
              <h3 className="font-semibold text-xs text-[#003A70]">{recomendacionDelDia.titulo}</h3>
              <p className="text-[11px] text-gray-600">{recomendacionDelDia.contenido}</p>
              {recomendacionDelDia.video && (
                <iframe className="w-full aspect-video rounded-xl" src={recomendacionDelDia.video} title="Video" allowFullScreen></iframe>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <PayComponent />
          </div>

          <div className="flex gap-2 pt-2">
            <Link href="/" className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-xs">
              ← Presentación
            </Link>
            <Link href="/simulador" className="flex-1 text-center bg-[#003A70] text-white py-2.5 rounded-xl font-bold text-xs">
              Simulador →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}