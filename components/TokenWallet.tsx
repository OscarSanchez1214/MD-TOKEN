"use client";

import { useState, useEffect, useCallback } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { MY_TOKEN_ADDRESS, getTokenDetails, sendMyToken } from "@/lib/token";

export default function TokenWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [decimals, setDecimals] = useState<number>(18);
  const [symbol, setSymbol] = useState<string>("MD");

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(true);

  // Función para intentar capturar la dirección de MiniKit
  const cargarDireccion = useCallback(() => {
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      const address = MiniKit.walletAddress;
      if (address) {
        setWalletAddress(address);
        fetchBalance(address as `0x${string}`);
        setIsLoadingAddress(false);
        return true;
      }
    }
    return false;
  }, []);

  // Efecto que reintenta buscar la dirección automáticamente (Soluciona el problema de carga lenta)
  useEffect(() => {
    if (!cargarDireccion()) {
      let intentos = 0;
      const intervalo = setInterval(() => {
        intentos++;
        if (cargarDireccion() || intentos >= 10) {
          clearInterval(intervalo);
          setIsLoadingAddress(false);
        }
      }, 500); // Reintenta cada 500ms durante 5 segundos
      
      return () => clearInterval(intervalo);
    }
  }, [cargarDireccion]);

  // Función para leer el saldo en la Blockchain
  const fetchBalance = async (address: `0x${string}`) => {
    try {
      const details = await getTokenDetails(address);
      setBalance(details.balance);
      setDecimals(details.decimals);
      setSymbol(details.symbol);
    } catch (err) {
      console.error("Error leyendo saldo:", err);
    }
  };

  // Ejecutar el envío
  const handleSend = async () => {
    if (!recipient || !amount) {
      setErrorMsg("Por favor, ingresa una dirección y un monto.");
      return;
    }

    setErrorMsg(null);
    setTxHash(null);
    setIsSending(true);

    try {
      const hash = await sendMyToken(recipient, amount, decimals);
      setTxHash(hash);
      
      setRecipient("");
      setAmount("");
      if (walletAddress) {
        setTimeout(() => fetchBalance(walletAddress as `0x${string}`), 5000);
      }
    } catch (error: any) {
      console.error("Error al enviar:", error);
      setErrorMsg(error.message || "La transacción fue rechazada o falló.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md border border-gray-100 font-sans mt-4">
      <h1 className="text-xl font-bold text-center text-[#003A70] mb-6 flex items-center justify-center gap-2">
        💼 Billetera Token {symbol}
      </h1>

      {/* SECCIÓN 1: BALANCE */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center shadow-sm relative">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Tu Balance Actual
        </p>
        
        {!walletAddress ? (
           <div className="py-4">
              {isLoadingAddress ? (
                <p className="text-sm text-blue-500 animate-pulse font-semibold">Cargando billetera...</p>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-red-500 font-semibold">No se detectó tu dirección</p>
                  <button 
                    onClick={cargarDireccion}
                    className="bg-[#013A72] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0154A0]"
                  >
                    🔄 Conectar / Detectar Billetera
                  </button>
                  <p className="text-[10px] text-gray-500">Asegúrate de haber iniciado sesión (SignIn).</p>
                </div>
              )}
           </div>
        ) : (
          <>
            <p className="text-4xl font-bold text-[#003A70] mb-2">
              {balance} {symbol}
            </p>
            <p className="text-[10px] text-gray-400 break-all">
              Contrato: {MY_TOKEN_ADDRESS}
            </p>
          </>
        )}
      </div>

      {/* SECCIÓN 2: ENVIAR TOKENS */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-sm font-bold text-[#003A70] mb-4">
          Enviar {symbol} a otra dirección
        </h2>
        
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Dirección Destino (World Chain)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={!walletAddress}
              className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Monto a transferir
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej. 500"
              min="0"
              disabled={!walletAddress}
              className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* AQUÍ ESTÁ LA MAGIA DEL BOTÓN: Si no hay wallet, dirá "Billetera no conectada" */}
        <button
          onClick={handleSend}
          disabled={isSending || !walletAddress}
          className={`w-full py-2 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
            !walletAddress
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isSending
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-[#013A72] hover:bg-[#0154A0] hover:scale-105 shadow-md"
          }`}
        >
          {!walletAddress 
            ? "Billetera no conectada" 
            : isSending 
            ? "Procesando en World App..." 
            : `Enviar ${symbol}`}
        </button>

        {errorMsg && (
          <div className="mt-3 px-4 py-2 bg-red-50 rounded-lg text-xs text-red-700 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {txHash && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-green-700 font-bold">¡Envío Exitoso!</p>
            <a 
              href={`https://worldchain-mainnet.explorer.alchemy.com/tx/${txHash}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-blue-500 underline break-all mt-1 inline-block"
            >
              Ver transacción en el explorador
            </a>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: RECIBIR TOKENS */}
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm text-center bg-gray-50">
        <h2 className="text-sm font-bold text-[#003A70] mb-2">Recibir {symbol}</h2>
        
        {walletAddress ? (
          <>
            <p className="text-xs text-gray-500 mb-2">Tu dirección pública es:</p>
            <div className="bg-white p-2 rounded border border-gray-200 flex flex-col items-center">
              <p className="text-xs text-gray-800 break-all font-mono font-medium">{walletAddress}</p>
            </div>
          </>
        ) : (
          <p className="text-xs text-red-400 font-medium">
            Dirección oculta. Conecta tu billetera para verla.
          </p>
        )}
      </div>
    </div>
  );
}
