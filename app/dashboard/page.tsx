'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MiniKit } from '@worldcoin/minikit-js'
import TokenWallet from '@/components/TokenWallet'
import Image from 'next/image'

export default function DashboardPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. INICIO DE SESIÓN SILENCIOSO
  useEffect(() => {
    const address = (MiniKit.user as any)?.walletAddress
    if (address) {
      setWalletAddress(address)
    }
  }, [])

  // 2. INICIO DE SESIÓN MANUAL (Con debug detallado)
  async function signInWithWallet() {
    if (!MiniKit.isInstalled()) {
      setErrorMsg('⚠️ MiniKit no detectado. Abre esta sección dentro de World App.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const nonce = crypto.randomUUID().replace(/-/g, '').substring(0, 10)

      const input = {
        nonce: nonce,
        statement: "Iniciar sesion en Billetera MD",
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }

      let result;
      
      // Intentamos todas las formas posibles de invocar MiniKit para evitar fallos de versión
      if ((MiniKit as any).commandsAsync?.walletAuth) {
        result = await (MiniKit as any).commandsAsync.walletAuth(input);
      } else if ((MiniKit as any).commands?.walletAuth) {
        result = await (MiniKit as any).commands.walletAuth(input);
      } else if ((MiniKit as any).walletAuth) {
        result = await (MiniKit as any).walletAuth(input);
      } else {
        throw new Error("Tu versión de MiniKit no soporta walletAuth o no está inicializada.");
      }

      if (!result || result.executedWith === "fallback" || !result.data) {
        setErrorMsg('❌ Autenticación cancelada o ejecutada en modo fallback.')
        return
      }

      setWalletAddress(result.data.address)

    } catch (error: any) {
      console.error(error)
      // ESTO ES CLAVE: Nos mostrará el error técnico real en pantalla
      setErrorMsg(`❌ Error real: ${error?.message || String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between px-4 py-6 text-gray-800 relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/fondo-md.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none"></div>

      <div className="w-full flex flex-col items-center flex-1 max-w-sm relative z-10">
        
        {/* Cabecera del Dashboard */}
        <div className="w-full flex justify-between items-center bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm mb-6 border border-white/50">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-md.png"
              alt="Mundo Didáctico"
              width={40}
              height={40}
              className="rounded-full shadow-sm bg-white/80 p-0.5"
            />
            <div>
              <h1 className="font-bold text-[#003A70] text-sm">Billetera MD</h1>
              <p className="text-[10px] text-gray-500 font-mono truncate w-24">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "World Chain"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push("/")}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition font-medium cursor-pointer"
          >
            Volver
          </button>
        </div>

        {/* Contenedor Principal */}
        <div className="w-full bg-white/95 rounded-3xl shadow-lg p-5 mb-6 backdrop-blur-md space-y-4 border border-white/50 text-center">
          
          {!walletAddress ? (
            <div className="py-8 space-y-4">
              <h2 className="text-lg font-bold text-[#003A70]">Conecta tu Billetera</h2>
              <p className="text-xs text-gray-600">Accede con tu cuenta de World App para ver tus tokens y gestionar tu balance.</p>
              
              <button
                onClick={signInWithWallet}
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Conectando...' : 'Abrir mi billetera'}
              </button>

              {errorMsg && (
                <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg break-words">{errorMsg}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-[#003A70]">Panel Financiero</span>
                <button 
                  onClick={() => setWalletAddress(null)}
                  className="text-[10px] text-red-500 hover:underline font-medium cursor-pointer"
                >
                  Cambiar cuenta
                </button>
              </div>

              {/* @ts-ignore */}
              <TokenWallet userWalletAddress={walletAddress as `0x${string}`} />
            </div>
          )}

        </div>

      </div>
      
      <footer className="text-center text-gray-700 font-medium text-[10px] pb-2 relative z-10">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
