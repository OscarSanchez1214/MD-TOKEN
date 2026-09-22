"use client";
import React, { useState, useRef, useEffect } from "react";

export default function SimuladorInversion({ onComplete }) {
  const [monto, setMonto] = useState<number>(100);
  const [aporte, setAporte] = useState<number>(50);
  const [anios, setAnios] = useState<number>(5);
  const [tasa, setTasa] = useState<number>(10);
  
  const [resultado, setResultado] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calcularInversion = () => {
    const meses = anios * 12;
    const tasaMensual = (tasa / 100) / 12;

    let total = monto;
    const historial = [monto];

    for (let m = 0; m < meses; m++) {
      total = total * (1 + tasaMensual) + aporte;
      if ((m + 1) % 12 === 0) historial.push(total);
    }

    const invertido = monto + (aporte * meses);
    const ganancia = total - invertido;

    setResultado({ invertido, total, ganancia, historial });
    
    // Llamamos a la función que dará los puntos/tokens al usuario
    if (onComplete) onComplete(15); 
  };

  // Dibujar gráfico cada vez que el resultado cambie
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
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Línea de valor final (Verde)
      ctx.strokeStyle = "#6bcf7f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < resultado.historial.length; i++) {
        const x = i * paso;
        const y = H - (resultado.historial[i] / max) * (H - 40) - 20;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [resultado]);

  return (
    <div className="bg-gray-50 p-4 rounded-2xl shadow-sm border border-gray-200 text-left w-full mt-4">
      <h3 className="font-bold text-[#003A70] mb-3 text-sm">🧮 Simulador de Interés Compuesto</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <label className="block text-gray-600 mb-1">Monto Inicial ($)</label>
          <input type="number" value={monto} onChange={(e) => setMonto(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Aporte Mensual ($)</label>
          <input type="number" value={aporte} onChange={(e) => setAporte(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Años</label>
          <input type="number" value={anios} onChange={(e) => setAnios(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Tasa Anual (%)</label>
          <input type="number" value={tasa} onChange={(e) => setTasa(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
        </div>
      </div>

      <button 
        onClick={calcularInversion}
        className="w-full bg-[#003A70] text-white py-2 rounded-xl font-bold text-xs mb-4 active:scale-95 transition-transform"
      >
        CALCULAR PROYECCIÓN
      </button>

      {resultado && (
        <div className="mt-2 text-xs">
          <div className="mb-2">
             💵 Invertido: <strong>${resultado.invertido.toLocaleString('es-CO')}</strong><br/>
             📈 Valor final: <strong>${resultado.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</strong><br/>
             🎉 Ganancia: <strong className="text-green-600">${resultado.ganancia.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</strong>
          </div>
          
          <canvas ref={canvasRef} width="280" height="120" className="w-full bg-white border rounded-lg mt-2"></canvas>
          
          <div className="flex justify-between mt-1 text-[10px] text-gray-500">
            <span><span className="text-green-500 font-bold">🟩</span> Con interés</span>
            <span><span className="text-red-500 font-bold">🟥</span> Aportado</span>
          </div>
        </div>
      )}
    </div>
  );
}
