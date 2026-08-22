"use client";

import { useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { MY_TOKEN_ADDRESS, getTokenDetails, sendMyToken } from "@/lib/token";

export default function TokenWallet() {
  // Estados para la lectura de datos
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [decimals, setDecimals] = useState<number>(18);
  const [symbol, setSymbol] = useState<string>("MD");

  // Estados para el formulario de envío
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicialización: Detectar si estamos en World App y cargar datos
  useEffect(() => {
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      const address = MiniKit.walletAddress;
      
      if (address) {
        setWalletAddress(address);
        fetchBalance(address as `0x${string}`);
      }
    }
  }, []);

  // Función para leer el saldo
  const fetchBalance = async (address: `0x${string}`) => {
    const details = await getTokenDetails(address);
    setBalance(details.balance);
    setDecimals(details.decimals);
    setSymbol(details.symbol);
  };

  // Función para manejar el envío de tokens
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
      
      // Limpiar formulario y actualizar saldo después de 5 segundos
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
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md border border-gray-100 font-sans">
      <h1 className="text-xl font-bold text-center text-blue-900 mb-6 flex items-center justify-center gap-2">
        💼 Billetera Token {symbol}
      </h1>

      {/* SECCIÓN 1: BALANCE */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Tu Balance Actual
        </p>
        <p className="text-4xl font-bold text-blue-900 mb-2">
          {balance} {symbol}
        </p>
        <p className="text-[10px] text-gray-400 break-all">
          Contrato: {MY_TOKEN_ADDRESS}
        </p>
      </div>

      {/* SECCIÓN 2: ENVIAR TOKENS */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-sm font-bold text-blue-900 mb-4">
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
              className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
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
              className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || !walletAddress}
          className={`w-full py-2 px-4 rounded font-semibold text-white transition-colors duration-200 ${
            isSending || !walletAddress
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {isSending ? "Procesando en World App..." : `Enviar ${symbol}`}
        </button>

        {isSending && (
          <p className="text-xs text-green-600 font-semibold text-center mt-3 animate-pulse">
            Solicitando confirmación en World App...
          </p>
        )}

        {errorMsg && (
          <p className="text-xs text-red-500 text-center mt-3 font-medium">
            {errorMsg}
          </p>
        )}

        {txHash && (
          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200 text-center">
            <p className="text-xs text-green-700 font-bold">¡Envío Exitoso!</p>
            <a 
              href={`https://worldchain-mainnet.explorer.alchemy.com/tx/${txHash}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-blue-500 underline break-all"
            >
              Ver transacción
            </a>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: RECIBIR TOKENS */}
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm text-center">
        <h2 className="text-sm font-bold text-blue-900 mb-2">Recibir {symbol}</h2>
        <p className="text-xs text-gray-500 mb-3">Tu dirección en World Chain:</p>
        
        {walletAddress ? (
          <div className="bg-gray-50 p-2 rounded border border-gray-200 flex flex-col items-center">
            <p className="text-xs text-gray-800 break-all font-mono">{walletAddress}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 p-2 bg-gray-50 rounded border border-gray-200 border-dashed">
            Abre la app desde World App para ver tu dirección
          </p>
        )}
      </div>
    </div>
  );
}
