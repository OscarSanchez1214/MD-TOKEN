"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MiniKit } from "@worldcoin/minikit-js";
import PayComponent from "@/components/Pay";
import TokenWallet from "@/components/TokenWallet";
import recomendaciones from "@/data/recomendaciones.json";

// Forzar el tipo de TokenWallet para evitar errores de TypeScript en props
const DynamicTokenWallet = TokenWallet as any;

// Dirección oficial de recepción de donaciones
const RECEIVER_ADDRESS = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const hoy = new Date().toISOString().split("T")[0];
  const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy);

  // Inicializar MiniKit y comprobar sesión previa al cargar la página
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!MiniKit.isInstalled()) {
        try {
          MiniKit.install();
        } catch (e) {
          console.error("Error al inicializar MiniKit:", e);
        }
      }

      // Comprobar si ya hay una sesión guardada
      const existingAddress = (MiniKit.user as any)?.walletAddress;
      if (existingAddress) {
        setWalletAddress(existingAddress);
      }
    }
  }, []);

  // Función corregida y optimizada para manejar la respuesta de MiniKit v2+
  const handleSignIn = async () => {
    if (!MiniKit.isInstalled()) {
      alert("Debes abrir esta app dentro de World App.");
      return;
    }

    setIsAuthenticating(true);
    setErrorMsg("");

    try {
      // 1. Obtener el nonce del backend o generar uno seguro de respaldo
      let nonce = crypto.randomUUID().replace(/-/g, "");
      try {
        const res = await fetch("/api/nonce");
        if (res.ok) {
          const data = await res.json();
          if (data?.nonce) nonce = data.nonce;
        }
      } catch (err) {
        console.warn("Usando nonce local de respaldo.");
      }

      const authOptions = {
        nonce,
        statement: "Inicia sesión para acceder a tu billetera de Mundo Didáctico.",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        chainId: 480, // Especificar red World Chain
      };

      const miniKitAny = MiniKit as any;
      let result: any = null;

      // 2. Invocación segura compatible con múltiples versiones del SDK
      if (typeof miniKitAny.walletAuth === "function") {
        result = await miniKitAny.walletAuth(authOptions);
      } else if (miniKitAny.commands && typeof miniKitAny.commands.walletAuth === "function") {
        result = await miniKitAny.commands.walletAuth(authOptions);
      } else if (miniKitAny.commandsAsync && typeof miniKitAny.commandsAsync.walletAuth === "function") {
        result = await miniKitAny.commandsAsync.walletAuth(authOptions);
      } else {
        throw new Error("El método walletAuth no está disponible en esta versión.");
      }

      // 3. Procesar el resultado usando finalPayload (estándar correcto de MiniKit)
      const finalPayload = result?.finalPayload;

      if (!finalPayload) {
        throw new Error("No se recibió respuesta de la billetera.");
      }

      if (finalPayload.status === "success") {
        const address = MiniKit.user?.walletAddress || finalPayload.address;
        if (address) {
          setWalletAddress(address);
        } else {
          setErrorMsg("Autenticación exitosa, pero no se detectó la dirección.");
        }
      } else {
        setErrorMsg("El usuario rechazó la firma o la autenticación falló.");
      }
    } catch (error: any) {
      console.error("Error técnico al iniciar sesión:", error);
      setErrorMsg(`Error: ${error.message || "No se pudo completar el acceso"}`);
    } finally {
      setIsAuthenticating(false);
    }
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
        
        {/* Cabecera / Logo */}
        <div className="mt-4 mb-6 text-center">
          <a
            href="https://edicionesmd.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/logo-md.png"
              alt="Mundo Didáctico Logo"
              width={90}
              height={90}
              className="mx-auto rounded-full shadow-md hover:scale-105 transition-transform"
              priority
            />
          </a>
          <h1 className="mt-3 text-2xl font-bold text-[#003A70]">
            MUNDO DIDÁCTICO
          </h1>
          <p className="text-gray-600 text-xs mt-0.5">
            Educación Emocional y Financiera
          </p>
        </div>

        {/* Tarjeta principal */}
        <div className="w-full max-w-sm bg-white/95 rounded-3xl shadow-lg p-5 mb-6 text-center backdrop-blur-sm space-y-5">
          
          {/* RENDERIZADO CONDICIONAL */}
          {walletAddress ? (
            <div className="w-full">
              <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700">Wallet MD (World Chain)</span>
                <button 
                  onClick={() => setWalletAddress(null)}
                  className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition"
                >
                  Cerrar sesión
                </button>
              </div>
              <DynamicTokenWallet userWalletAddress={walletAddress as `0x${string}`} />
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Bloque de recomendación */}
              <div>
                <h2 className="text-lg font-bold text-[#003A70] mb-2">
                  Recomendación del Día 💡
                </h2>

                {recomendacionDelDia ? (
                  <article className="bg-gray-50 p-3.5 rounded-2xl shadow-sm text-left border border-gray-100">
                    <h3 className="font-semibold text-sm text-[#003A70] mb-1">
                      {recomendacionDelDia.titulo}
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed mb-3">
                      {recomendacionDelDia.contenido}
                    </p>

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
                      <p className="text-[11px] text-gray-400 mt-2 text-center">
                        🎬 Próximamente video relacionado
                      </p>
                    )}
                  </article>
                ) : (
                  <p className="text-gray-500 text-xs">
                    No hay recomendación disponible para hoy.
                  </p>
                )}
              </div>

              {/* Bloque de donación / pagos */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
                <h4 className="text-[11px] font-medium text-gray-600 leading-relaxed">
                  Aprende a manejar mejor tu dinero, fortalecer tus hábitos e impulsar tu inteligencia financiera. 💡💰📈
                </h4>
                
                <p className="text-[11px] text-gray-500">
                  Apóyanos en <strong>MD</strong>, <strong>WLD</strong> o <strong>USDC</strong>.
                </p>

                <PayComponent />

                <div className="text-[10px] text-gray-400 break-all">
                  Dirección oficial:{" "}
                  <code className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                    {RECEIVER_ADDRESS}
                  </code>
                </div>
              </div>

              {/* Botón de Autenticación con World App */}
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                  {isAuthenticating ? 'Conectando...' : 'Abrir mi billetera'}
                </button>

                {errorMsg && (
                  <p className="text-red-500 mt-3 text-xs font-medium">{errorMsg}</p>
                )}
              </div>

            </div>
          )}
          
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-[10px] pb-2">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
