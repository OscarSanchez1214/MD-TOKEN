"use client";

import { useState, useEffect } from "react";
import { MY_TOKEN_ADDRESS, getTokenDetails, sendMyToken } from "@/lib/token";
import { MiniKit } from "@worldcoin/minikit-js";

interface Props {
  userWalletAddress?: `0x${string}`; // Opcional: Si no viene, se detecta automáticamente con MiniKit
}

export default function TokenWallet({ userWalletAddress: initialAddress }: Props) {
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(initialAddress);
  const [balance, setBalance] = useState<string>("0");
  const [symbol, setSymbol] = useState<string>("MD");
  const [decimals, setDecimals] = useState<number>(18);
  const [loading, setLoading] = useState<boolean>(true);

  // Estado del formulario de envío
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [txStatus, setTxStatus] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  // Obtener dirección del usuario mediante MiniKit si no se pasó como prop
  useEffect(() => {
    if (initialAddress) {
      setWalletAddress(initialAddress);
    } else if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      const address = MiniKit.user?.walletAddress as `0x${string}` | undefined;
      if (address) setWalletAddress(address);
    }
  }, [initialAddress]);

  // Cargar datos del token al tener dirección
  const fetchBalance = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const data = await getTokenDetails(walletAddress);
      setBalance(data.balance);
      setSymbol(data.symbol);
      setDecimals(data.decimals);
    } catch (err) {
      console.error("Error al consultar balance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    } else {
      setLoading(false);
    }
  }, [walletAddress]);

  // Manejar el envío
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTxStatus("Solicitando confirmación en World App...");

    try {
      const txHash = await sendMyToken(recipient, amount, decimals);
      setTxStatus(`¡Envío exitoso! Tx: ${txHash.slice(0, 10)}...`);
      setAmount("");
      setRecipient("");
      fetchBalance(); // Actualiza el balance tras enviar
    } catch (err: any) {
      setTxStatus(`Error: ${err.message || "No se pudo realizar el envío"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full mt-6 pt-6 border-t border-gray-200 text-left">
      <h3 className="text-lg font-bold text-[#003A70] mb-4 text-center">
        💼 Billetera Token {symbol}
      </h3>

      {/* Tarjeta de Balance */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-center shadow-sm">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          Tu Balance Actual
        </span>
        <h4 className="text-2xl font-extrabold text-[#003A70] my-1">
          {loading ? "Cargando..." : `${balance} ${symbol}`}
        </h4>
        <p className="text-[10px] text-gray-400 break-all">
          Contrato: {MY_TOKEN_ADDRESS}
        </p>
      </div>

      {/* Formulario de Envío */}
      <form onSubmit={handleSend} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <h4 className="text-sm font-semibold text-[#003A70] mb-3">
          Enviar {symbol} a otra dirección
        </h4>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Dirección Destino (World Chain)
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003A70] bg-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Monto a transferir
          </label>
          <input
            type="number"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003A70] bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-2.5 px-4 bg-[#003A70] hover:bg-[#002850] text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {sending ? "Procesando en World App..." : `Enviar ${symbol}`}
        </button>

        {txStatus && (
          <p
            className={`text-xs mt-3 text-center font-medium ${
              txStatus.startsWith("Error") ? "text-red-500" : "text-green-600"
            }`}
          >
            {txStatus}
          </p>
        )}
      </form>

      {/* Sección para Recibir */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center shadow-sm">
        <h4 className="text-sm font-semibold text-[#003A70] mb-1">
          Recibir {symbol}
        </h4>
        <p className="text-xs text-gray-500 mb-2">
          Tu dirección en World Chain:
        </p>
        <div className="bg-white p-2 rounded-lg border border-dashed border-gray-300 text-[11px] font-mono break-all text-gray-700">
          {walletAddress || "Abre la app desde World App para ver tu dirección"}
        </div>
      </div>
    </div>
  );
}
