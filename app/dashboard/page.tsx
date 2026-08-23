"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-4">
        <h1 className="text-xl font-bold text-[#003A70]">¡Bienvenido al Dashboard!</h1>
        <p className="text-xs text-gray-600">La navegación ha funcionado correctamente.</p>
        
        <button
          onClick={() => router.push("/")}
          className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm"
        >
          Volver al Inicio
        </button>
      </div>
    </main>
  );
}
