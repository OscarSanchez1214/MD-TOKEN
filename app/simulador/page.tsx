"use client";

import React, { useState } from "react";
import Link from "next/link";
import SimuladorInversion from "@/components/SimuladorInversion";

export default function SimuladorPage() {
  const [mensajeRecompensa, setMensajeRecompensa] = useState<string | null>(null);

  // Tipado explícito (puntos: number) para solucionar el error de TypeScript en Vercel
  const manejarCompletado = (puntos: number): void => {
    setMensajeRecompensa(`¡Felicidades! Has ganado ${puntos} Puntos MD 🪙 por usar el simulador.`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0b0f1c] text-white font-sans relative overflow-hidden">
      {/* Luces de fondo estilo neón */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#6c5ce7] opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-[#00cec9] opacity-20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm bg-[rgba(18,26,40,0.85)] backdrop-blur-md text-gray-100 rounded-3xl p-5 shadow-2xl border border-[rgba(108,92,231,0.3)] relative z-10">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
          <h1 className="text-base font-bold text-[#00cec9]">🧮 Simulador de Inversión</h1>
          <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
            ← Inicio
          </Link>
        </div>
        
        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Calcula tus proyecciones de ahorro e interés compuesto para acumular puntos en tu <strong className="text-white">Billetera MD</strong>.
        </p>

        {/* Notificación de Recompensa al interactuar */}
        {mensajeRecompensa && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-3 rounded-2xl text-xs font-semibold mb-4 text-center animate-bounce">
            {mensajeRecompensa}
          </div>
        )}

        {/* Componente del Simulador */}
        <SimuladorInversion onComplete={manejarCompletado} />

        {/* Menú de Navegación Inferior */}
        <div className="mt-5 flex gap-2 pt-3 border-t border-white/10">
          <Link 
            href="/recomendaciones" 
            className="flex-1 text-center bg-white/10 hover:bg-white/15 text-white py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 border border-white/10"
          >
            📺 Ver Canal
          </Link>
          <Link 
            href="/dashboard" 
            className="flex-1 text-center bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white py-3 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            💼 Mi Billetera
          </Link>
        </div>

      </div>
    </main>
  );
}
