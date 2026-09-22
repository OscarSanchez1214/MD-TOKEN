"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

export default function PresentacionPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 8;

  // Manejo de gestos Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToSlide = (index: number) => {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const deltaX = touchEndX.current - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f1c] text-[#f0f3fa] flex items-center justify-center p-3 relative overflow-hidden font-sans">
      {/* Estilos CSS adaptados */}
      <style jsx>{`
        .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; pointer-events: none; }
        .orb-1 { width: 200px; height: 200px; background: #6c5ce7; top: -60px; right: -60px; }
        .orb-2 { width: 180px; height: 180px; background: #00cec9; bottom: -50px; left: -50px; }
        .card { background: linear-gradient(145deg, rgba(108, 92, 231, 0.2) 0%, rgba(0, 206, 201, 0.1) 100%); border: 1px solid rgba(108, 92, 231, 0.2); border-radius: 16px; padding: 14px 16px; }
        .feature-item { display: flex; gap: 12px; align-items: flex-start; background: rgba(255, 255, 255, 0.03); padding: 12px; border-radius: 14px; border-left: 3px solid #6c5ce7; }
        .roadmap-phase { background: rgba(255, 255, 255, 0.04); border-radius: 18px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 10px; }
      `}</style>

      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="w-full max-w-[520px] h-[720px] max-h-[92vh] relative rounded-[28px] bg-[rgba(12,18,30,0.7)] backdrop-blur-md border border-[rgba(108,92,231,0.25)] shadow-2xl flex flex-col overflow-hidden">
        
        {/* BARRA DE PROGRESO */}
        <div className="w-full h-1 bg-white/10 absolute top-0 left-0 z-20">
          <div 
            className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] transition-all duration-300 shadow-[0_0_12px_#a29bfe]"
            style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
          ></div>
        </div>

        {/* SLIDES WRAPPER */}
        <div 
          className="flex-1 relative overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {/* SLIDE 1: PORTADA */}
            <div className="min-w-full h-full p-6 flex flex-col gap-4 overflow-y-auto">
              <span className="bg-[#6c5ce7]/20 border border-[#6c5ce7]/50 text-[#a29bfe] text-[10px] font-bold px-3 py-1 rounded-full w-fit">WORLDCHAIN · ERC20</span>
              <div className="text-5xl text-center my-2">🪙</div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] bg-clip-text text-transparent">Token MD</h1>
              <p className="text-sm text-gray-200">
                La criptomoneda de utilidad para el ecosistema educativo <strong className="text-[#00cec9]">EdicionesMD.com</strong>
              </p>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#6c5ce7]/40 to-transparent my-1"></div>
              <div className="space-y-3">
                <div className="card flex items-center gap-3">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <div className="font-bold text-white text-sm">Aprende y Gana</div>
                    <div className="text-xs text-gray-400">Aprende sobre cripto con experiencias reales</div>
                  </div>
                </div>
                <div className="card flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-bold text-white text-sm">Bajas comisiones</div>
                    <div className="text-xs text-gray-400">Transacciones rápidas en WorldChain</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLIDE 2: INTRODUCCIÓN */}
            <div className="min-w-full h-full p-6 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Introducción</h3>
              <h2 className="text-xl font-bold text-white">¿Qué es Token MD?</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                El <strong className="text-white">Token MD</strong> es una criptomoneda creada en la blockchain <span className="text-[#00cec9]">WorldChain</span> bajo el estándar ERC20.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="card">🛒 <div className="font-bold text-white mt-1">Compra de cursos</div></div>
                <div className="card">🎯 <div className="font-bold text-white mt-1">Recompensas</div></div>
                <div className="card">🔗 <div className="font-bold text-white mt-1">Interoperabilidad</div></div>
                <div className="card">⚡ <div className="font-bold text-white mt-1">Bajas comisiones</div></div>
              </div>
            </div>

            {/* SLIDE 3: FUNCIONES */}
            <div className="min-w-full h-full p-6 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Ecosistema</h3>
              <h2 className="text-xl font-bold text-white">Funciones y Beneficios</h2>
              <div className="space-y-2 text-xs">
                <div className="feature-item">✅ <div><strong className="text-[#00cec9]">Compra de cursos:</strong> Adquiere material educativo.</div></div>
                <div className="feature-item">🎯 <div><strong className="text-[#00cec9]">Recompensas:</strong> Incentivos por aprender.</div></div>
                <div className="feature-item">⚡ <div><strong className="text-[#00cec9]">Bajas comisiones:</strong> Pagos rápidos y económicos.</div></div>
              </div>
            </div>

            {/* SLIDE 4: PROPÓSITO */}
            <div className="min-w-full h-full p-6 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Filosofía</h3>
              <h2 className="text-xl font-bold text-white">El propósito de MD</h2>
              <p className="text-xs text-gray-300">
                Sistema <strong className="text-[#00cec9]">“Aprende y Gana”</strong> para interactuar con criptomonedas de forma real.
              </p>
              <div className="space-y-2 text-xs mt-2">
                <div className="card">💰 Comprar, enviar y recibir tokens</div>
                <div className="card">🔐 Usar billeteras digitales</div>
                <div className="card">📊 Entender el interés y la inversión</div>
              </div>
            </div>

            {/* SLIDE 5: ADQUISICIÓN */}
            <div className="min-w-full h-full p-6 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Adquisición</h3>
              <h2 className="text-xl font-bold text-white">Cómo obtener Token MD</h2>
              <div className="space-y-2 text-xs">
                <div className="feature-item">🔹 <div><strong>World App:</strong> Intercambia tokens directamente.</div></div>
                <div className="feature-item">🔹 <div><strong>Actividades MD:</strong> Gana interactuando en la plataforma.</div></div>
              </div>
            </div>

            {/* SLIDE 6: ROADMAP 1 */}
            <div className="min-w-full h-full p-6 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Hoja de Ruta</h3>
              <h2 className="text-xl font-bold text-white">Roadmap · Parte 1</h2>
              <div className="roadmap-phase text-xs">
                <div className="font-bold text-white mb-1">🔹 Fase 1: Emisión</div>
                <p className="text-gray-400">Contrato inteligente en WorldChain y pruebas iniciales.</p>
              </div>
              <div className="roadmap-phase text-xs">
                <div className="font-bold text-white mb-1">🔹 Fase 2: Integración</div>
                <p className="text-gray-400">Pasarela de pago y sistema de recompensas automatizado.</p>
              </div>
            </div>

            {/* SLIDE 7: ROADMAP 2 */}
            <div className="min-w-full h-full p-6 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Hoja de Ruta</h3>
              <h2 className="text-xl font-bold text-white">Roadmap · Parte 2</h2>
              <div className="roadmap-phase text-xs">
                <div className="font-bold text-white mb-1">🔹 Fase 3: Lanzamiento</div>
                <p className="text-gray-400">Lanzamiento oficial en EdicionesMD.com y adopción.</p>
              </div>
            </div>

            {/* SLIDE 8: ACCESOS Y NAVEGACIÓN PRINCIPAL */}
            <div className="min-w-full h-full p-6 flex flex-col gap-4 overflow-y-auto">
              <h3 className="text-xs font-semibold text-[#00cec9] uppercase tracking-wider">Explorar Aplicación</h3>
              <h2 className="text-xl font-bold text-white">Elige una Opción</h2>
              
              <div className="flex flex-col gap-3 mt-2">
                <Link href="/simulador" className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white p-3.5 rounded-2xl font-bold text-sm flex items-center justify-between shadow-lg active:scale-95 transition-transform">
                  <span>🧮 Ir al Simulador Interactivo</span>
                  <span>→</span>
                </Link>

                <Link href="/recomendaciones" className="w-full bg-white/10 border border-white/20 text-white p-3.5 rounded-2xl font-bold text-sm flex items-center justify-between active:scale-95 transition-transform">
                  <span>📺 Recomendaciones y Canal</span>
                  <span>→</span>
                </Link>

                <Link href="/dashboard" className="w-full bg-black/50 border border-white/10 text-gray-300 p-3.5 rounded-2xl font-bold text-sm flex items-center justify-between active:scale-95 transition-transform">
                  <span>💼 Mi Billetera MD</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* CONTROLES DE NAVEGACIÓN */}
        <div className="flex items-center justify-between p-4 bg-black/60 border-t border-white/10 z-10">
          <button 
            onClick={() => goToSlide(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full bg-[#6c5ce7]/20 border border-[#6c5ce7]/40 text-white flex items-center justify-center disabled:opacity-30"
          >
            ‹
          </button>
          
          <div className="flex gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div 
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full cursor-pointer transition-all ${i === currentIndex ? 'w-5 bg-[#6c5ce7]' : 'w-2 bg-white/20'}`}
              ></div>
            ))}
          </div>

          <button 
            onClick={() => goToSlide(currentIndex + 1)}
            disabled={currentIndex === totalSlides - 1}
            className="w-10 h-10 rounded-full bg-[#6c5ce7]/20 border border-[#6c5ce7]/40 text-white flex items-center justify-center disabled:opacity-30"
          >
            ›
          </button>
        </div>

      </div>
    </main>
  );
}
