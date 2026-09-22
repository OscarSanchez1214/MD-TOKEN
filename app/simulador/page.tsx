"use client";

import React from "react";
import Link from "next/link";
import SimuladorInversion from "@/components/SimuladorInversion";

export default function SimuladorPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-sm bg-white text-gray-800 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-base font-bold text-[#003A70]">🧮 Simulador de Inversión</h1>
          <Link href="/" className="text-xs text-gray-500 underline">Inicio</Link>
        </div>
        
        <p className="text-xs text-gray-600 mb-4">
          Calcula tus proyecciones de ahorro e interés compuesto para ganar puntos en tu Billetera MD.
        </p>

        <SimuladorInversion onComplete={(puntos) => alert(`¡Ganaste ${puntos} puntos MD por interactuar!`)} />

        <div className="mt-4 flex gap-2">
          <Link href="/recomendaciones" className="w-full text-center bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold text-xs">
            Ver Canal
          </Link>
          <Link href="/dashboard" className="w-full text-center bg-black text-white py-3 rounded-2xl font-bold text-xs">
            Ir a Billetera
          </Link>
        </div>
      </div>
    </main>
  );
}