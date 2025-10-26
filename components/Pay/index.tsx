"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { MiniKit } from "@worldcoin/minikit-js";

/**
 * Token addresses (tus contratos reales)
 */
const TOKEN_SYMBOL_MAP: Record<string, string> = {
  MD: "0x6335c1F2967A85e98cCc89dA0c87e672715284dB",
  WLD: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  USDC: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
};

export default function PayComponent() {
  const [amount, setAmount] = useState<string>("");
  const [token, setToken] = useState<string>("MD");
  const [toAddress, setToAddress] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [status, setStatus] = useState<string>("Listo");
  const [scanning, setScanning] = useState(false);

  const readerRef = useRef<Html5Qrcode | null>(null);
  const html5QrId = "html5qr-reader";

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        // stop() -> Promise, clear() -> void
        readerRef.current.stop().catch(() => {});
        try { readerRef.current.clear(); } catch {}
      }
    };
  }, []);

  // START / STOP scanner
  const startScanner = async () => {
    try {
      setQrValue("");
      setToAddress("");
      setScanning(true);
      const reader = new Html5Qrcode(html5QrId, false);
      readerRef.current = reader;

      await reader.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          // parse minimal: if JSON with address/amount -> use it; else treat as address
          try {
            const j = JSON.parse(decodedText);
            if (j.address) {
              setToAddress(j.address);
              if (j.amount) setAmount(String(j.amount));
            } else {
              setToAddress(decodedText);
            }
          } catch {
            setToAddress(decodedText);
          }
          reader.stop().then(() => setScanning(false)).catch(() => setScanning(false));
        },
        (err) => {
          // ignore frequent warnings
        }
      );
    } catch (err) {
      console.error("startScanner error:", err);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (!readerRef.current) {
      setScanning(false);
      return;
    }
    try {
      await readerRef.current.stop().catch(() => {});
      try { readerRef.current.clear(); } catch {}
    } catch (err) {
      console.error("stopScanner error:", err);
    } finally {
      readerRef.current = null;
      setScanning(false);
    }
  };

  // GENERAR QR (local)
  const handleGenerateQR = () => {
    if (!toAddress) return alert("Ingresa dirección antes de generar QR");
    if (!amount) return alert("Ingresa monto antes de generar QR");
    const payload = JSON.stringify({ address: toAddress, amount, token });
    setQrValue(payload);
    setStatus("QR generado");
  };

  // FUNCIÓN CENTRAL DE PAGO — tolerante a versiones del SDK
  const handlePayment = async () => {
    if (!toAddress) return alert("Ingresa dirección destino");
    if (!amount || Number(amount) <= 0) return alert("Ingresa un monto válido");

    setStatus("Iniciando pago...");
    try {
      const minikit = new MiniKit();

      // Strategy: try multiple method shapes to be compatible with different versions
      const anyKit = minikit as any;

      // prefer direct pay if present
      if (typeof anyKit.pay === "function") {
        await anyKit.pay({
          to: toAddress,
          token: TOKEN_SYMBOL_MAP[token] ?? token,
          amount: amount.toString(),
          description: `Pago ${token} desde Mundo Didáctico`,
        });
        setStatus("✅ Pago realizado (pay)");
        return;
      }

      // try actions.pay
      if (anyKit.actions && typeof anyKit.actions.pay === "function") {
        await anyKit.actions.pay({
          to: toAddress,
          token: TOKEN_SYMBOL_MAP[token] ?? token,
          amount: amount.toString(),
          description: `Pago ${token} desde Mundo Didáctico`,
        });
        setStatus("✅ Pago realizado (actions.pay)");
        return;
      }

      // try actions.send (some versions)
      if (anyKit.actions && typeof anyKit.actions.send === "function") {
        await anyKit.actions.send({
          to: toAddress,
          token: TOKEN_SYMBOL_MAP[token] ?? token,
          amount: amount.toString(),
          description: `Pago ${token} desde Mundo Didáctico`,
        });
        setStatus("✅ Pago realizado (actions.send)");
        return;
      }

      // last resort: attempt executeAction or generic call
      if (typeof anyKit.executeAction === "function") {
        await anyKit.executeAction("send", {
          to: toAddress,
          token: TOKEN_SYMBOL_MAP[token] ?? token,
          amount: amount.toString(),
          description: `Pago ${token} desde Mundo Didáctico`,
        });
        setStatus("✅ Pago realizado (executeAction)");
        return;
      }

      // if none available, show error
      throw new Error("No compatible payment method found in MiniKit instance");
    } catch (err: any) {
      console.error("Pago error:", err);
      setStatus(`❌ Error al pagar: ${err?.message ?? err}`);
      alert("Error al procesar el pago. Revisa consola para más detalles.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-3">Enviar Token (MD / WLD / USDC)</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium">Token</label>
        <select value={token} onChange={(e) => setToken(e.target.value)} className="w-full border p-2 rounded">
          <option value="MD">MD</option>
          <option value="WLD">WLD</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Dirección destino</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="0x..."
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Monto</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Ej. 1.5"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={handleGenerateQR} className="flex-1 bg-blue-600 text-white py-2 rounded">Generar QR</button>
        {!scanning ? (
          <button onClick={startScanner} className="bg-green-600 text-white py-2 px-3 rounded">Iniciar escáner</button>
        ) : (
          <button onClick={stopScanner} className="bg-red-600 text-white py-2 px-3 rounded">Detener</button>
        )}
      </div>

      <div id={html5QrId} style={{ width: 300, height: 300, margin: "0 auto 12px" }} />

      {qrValue && (
        <div className="mb-3 flex flex-col items-center">
          <QRCode value={qrValue} size={160} />
          <p className="text-sm text-gray-600 mt-2">QR para escanear con World App</p>
        </div>
      )}

      <div className="mb-3">
        <button onClick={handlePayment} className="w-full bg-indigo-600 text-white py-2 rounded">
          Enviar {token}
        </button>
      </div>

      <p className="text-sm text-gray-700">Estado: {status}</p>
    </div>
  );
}

// Alias por compatibilidad con importaciones antiguas
export const PayBlockWithQR = PayComponent;
