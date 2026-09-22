"use client";

import React, { useState, useRef, useEffect } from "react";

interface ResultadoInversion {
  invertido: number;
  total: number;
  ganancia: number;
  historial: number[];
}

interface SimuladorInversionProps {
  onComplete?: (puntos: number) => void;
}

export default function SimuladorInversion({ onComplete }: SimuladorInversionProps) {
  const [monto, setMonto] = useState<number>(100);
  const [aporte, setAporte] = useState<number>(50);
  const [anios, setAnios] = useState<number>(5);
  const [tasa, setTasa] = useState<number>(10);

  const [resultado, setResultado] = useState<ResultadoInversion | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const calcularInversion = (): void => {
    const meses = anios * 12;
    const tasaMensual = (tasa / 100) / 12;

    let total = monto;
    const historial: number[] = [monto];

    for (let m = 0; m < meses; m++) {
      total = total * (1 + tasaMensual) + aporte;
      if ((m + 1) % 12 === 0) historial.push(total);
    }

    const invertido = monto + aporte * meses;
    const ganancia = total - invertido;

    setResultado({ invertido, total, ganancia, historial });

    if (onComplete) {
      onComplete(15);
    }
  };

  useEffect(() => {
    if (resultado && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const max = Math.max(...resultado.historial, resultado.invertido);
      const paso = W / (resultado.historial.length - 1 || 1);

      // Línea de dinero invertido (Rojo)
      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < resultado.historial.length; i++) {
        const x = i * paso;
        const y = H - (resultado.invertido / max) * (H - 40) - 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Línea de valor final (Verde)
      ctx.strokeStyle = "#6bcf7f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < resultado.historial.length; i++) {
        const x = i * paso;
        const y = H - (resultado.historial[i] / max) * (H - 40) - 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [resultado]);

  return (
    <div className="bg-[#121a28] p-4 rounded-2xl border border-[#6c5ce7]/30 text-left w-full">
      <h3 className="font-bold text-[#00cec9] mb-3 text-xs uppercase tracking-wider">
        🧮 Parámetros de Inversión
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <label className="block text-gray-400 mb-1">Monto Inicial ($)</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[#00cec9]"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Aporte Mensual ($)</label>
          <input
            type="number"
            value={aporte}
            onChange={(e) => setAporte(Number(e.target.value))}
            className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[#00cec9]"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Años</label>
          <input
            type="number"
            value={anios}
            onChange={(e) => setAnios(Number(e.target.value))}
            className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[#00cec9]"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Tasa Anual (%)</label>
          <input
            type="number"
            value={tasa}
            onChange={(e) => setTasa(Number(e.target.value))}
            className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[#00cec9]"
          />
        </div>
      </div>

      <button
        onClick={calcularInversion}
        className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white py-2.5 rounded-xl font-bold text-xs mb-3 active:scale-95 transition-transform"
      >
        CALCULAR PROYECCIÓN
      </button>

      {resultado && (
        <div className="mt-3 text-xs bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
          <div className="space-y-1">
            <p>💵 Invertido: <strong>${resultado.invertido.toLocaleString("es-CO")}</strong></p>
            <p>📈 Valor final: <strong>${resultado.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</strong></p>
            <p>🎉 Ganancia: <strong className="text-emerald-400">${resultado.ganancia.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</strong></p>
          </div>

          <canvas
            ref={canvasRef}
            width="280"
            height="110"
            className="w-full bg-black/50 border border-white/10 rounded-lg mt-2"
          ></canvas>

          <div className="flex justify-between text-[10px] text-gray-400 pt-1">
            <span>🟩 Con Interés</span>
            <span>🟥 Dinero Aportado</span>
          </div>
        </div>
      )}
    </div>
  );
}
