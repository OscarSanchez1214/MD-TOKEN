"use client";

import { useEffect, useRef, useState } from "react";
import { MiniKit, PayCommandInput } from "@worldcoin/minikit-js";
import { Html5Qrcode } from "html5-qrcode";
import { BrowserProvider, Contract, isAddress } from "ethers";

// === CONFIGURACIÓN DE TOKENS ===
const TOKEN_CONFIG = {
  WLD: {
    symbol: "WLD",
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  },
  USDC: {
    symbol: "USDC",
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
  },
  MD: {
    symbol: "MD",
    address: "0x6335c1F2967A85e98cCc89dA0c87e672715284dB",
  },
};

const DEFAULT_DECIMALS = 18;

// === FUNCIONES AUXILIARES ===
function amountToUnits(amount: string | number, decimals: number): string {
  const amtStr = typeof amount === "number" ? amount.toString() : amount;
  if (!/^\d+(\.\d+)?$/.test(amtStr)) throw new Error("Formato de monto inválido");
  const [wholePart, fractionPart = ""] = amtStr.split(".");
  if (fractionPart.length > decimals) {
    throw new Error(`Más decimales de los permitidos: ${decimals}`);
  }
  const fractionPadded = fractionPart.padEnd(decimals, "0");
  const wholeBig = BigInt(wholePart);
  const fractionBig = BigInt(fractionPadded || "0");
  return (wholeBig * 10n ** BigInt(decimals) + fractionBig).toString();
}

async function fetchTokenDecimals(tokenAddress: string): Promise<number> {
  try {
    if ((window as any).ethereum) {
      const provider = new BrowserProvider((window as any).ethereum);
      const erc20 = new Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)"],
        await provider.getSigner()
      );
      const d: number = await erc20.decimals();
      return d;
    }
  } catch (e) {
    console.warn("No se pudo leer decimals desde provider:", e);
  }
  return DEFAULT_DECIMALS;
}

function parseQrContent(text: string) {
  try {
    const j = JSON.parse(text);
    if (j.address) return { address: j.address, amount: j.amount?.toString() ?? null };
  } catch (e) {}

  if (text.startsWith("ethereum:") || text.startsWith("wc:") || text.startsWith("md:")) {
    const withoutScheme = text.split(":")[1] ?? text;
    const [maybeAddress, query] = withoutScheme.split("?");
    const params = new URLSearchParams(query || "");
    let amount = params.get("amount") || params.get("value") || null;
    return { address: maybeAddress, amount };
  }

  const parts = text.trim().split(/\s+/);
  if (isAddress(parts[0])) {
    return { address: parts[0], amount: parts[1] ?? null };
  }

  if (isAddress(text.trim())) return { address: text.trim(), amount: null };

  return null;
}

// === COMPONENTE PRINCIPAL ===
export const PayBlockWithQR = () => {
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<{ address: string; amount?: string } | null>(null);
  type ExtendedTokens = "WLD" | "USDC" | "MD" | string;
symbol: selectedToken as ExtendedTokens,

  const readerRef = useRef<Html5Qrcode | null>(null);
  const html5QrId = "html5qr-reader";

  useEffect(() => {
    return () => {
      const stopReader = async () => {
        if (readerRef.current) {
          try {
            await readerRef.current.stop();
            await readerRef.current.clear();
          } catch (error) {
            console.warn("Error al limpiar lector QR:", error);
          }
        }
      };
      stopReader();
    };
  }, []);

  const startScanner = async () => {
    setDetected(null);
    setScanning(true);
    const html5Qr = new Html5Qrcode(html5QrId, false);
    readerRef.current = html5Qr;

    try {
      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          const parsed = parseQrContent(decodedText);
          if (parsed?.address) {
            setDetected(parsed);
            html5Qr
              .stop()
              .then(() => setScanning(false))
              .catch(() => setScanning(false));
          } else {
            console.warn("QR no contiene dirección válida:", decodedText);
          }
        },
        (errorMessage) => {
          console.warn("Error escaneando QR:", errorMessage);
        }
      );
    } catch (err) {
      console.error("Error al iniciar scanner:", err);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.stop();
        await readerRef.current.clear();
      } catch (e) {
        console.warn("Error al detener escáner:", e);
      } finally {
        readerRef.current = null;
      }
    }
    setScanning(false);
  };

  const enviarPago = async (to: string, amountHuman?: string) => {
    try {
      const res = await fetch(`/api/initiate-payment`, { method: "POST" });
      const { id } = await res.json();

      const tokenInfo = TOKEN_CONFIG[selectedToken];
      const decimals = await fetchTokenDecimals(tokenInfo.address);

      if (!amountHuman) {
        amountHuman = prompt(`Ingresa el monto en ${selectedToken}`) || undefined;
        if (!amountHuman) {
          alert("Monto no ingresado, cancelando.");
          return null;
        }
      }

      const tokenAmount = amountToUnits(amountHuman, decimals);

      const payload: PayCommandInput = {
        reference: id,
        to,
        tokens: [
          {
            symbol: selectedToken,
            token_address: tokenInfo.address,
            token_amount: tokenAmount,
          },
        ],
        description: `Pago ${selectedToken} a ${to}`,
      };

      if (!MiniKit.isInstalled()) {
        alert("Abre esta MiniApp desde World App para realizar el pago.");
        return null;
      }

      const response = await MiniKit.commandsAsync.pay(payload);
      return response;
    } catch (e) {
      console.error("Error enviando pago:", e);
      alert("Error al intentar enviar el pago.");
      return null;
    }
  };

  const handleUseDetected = async () => {
    if (!detected) return;
    const to = detected.address;
    const amount = detected.amount ?? undefined;

    const respuesta = await enviarPago(to, amount);
    const resultado = respuesta?.finalPayload;
    if (!resultado) return;

    if (resultado.status === "success") {
      const confirmRes = await fetch(`/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: resultado }),
      });
      const json = await confirmRes.json();
      if (json.success) alert(`✅ Pago ${selectedToken} realizado con éxito`);
      else alert("❌ El pago no se pudo confirmar en servidor");
    } else {
      alert("❌ El pago fue cancelado o falló");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Enviar Token (MD, WLD, USDC)</h2>

      {/* Selector de token */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Token:</label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value as "MD" | "WLD" | "USDC")}
          className="border p-2 rounded"
        >
          <option value="MD">MD</option>
          <option value="WLD">WLD</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      {/* Escáner QR */}
      <div className="mb-3">
        {!scanning && (
          <button
            onClick={startScanner}
            className="bg-green-600 text-white px-3 py-2 rounded mr-2"
          >
            Iniciar escáner QR
          </button>
        )}
        {scanning && (
          <button
            onClick={stopScanner}
            className="bg-red-600 text-white px-3 py-2 rounded mr-2"
          >
            Detener escáner
          </button>
        )}
      </div>

      <div id={html5QrId} style={{ width: 300, height: 300, marginBottom: 12 }} />

      {detected ? (
        <div className="border p-3 rounded">
          <p>
            Dirección detectada: <code>{detected.address}</code>
          </p>
          <p>
            Monto detectado: <strong>{detected.amount ?? "No especificado"}</strong>
          </p>
          <div className="mt-2">
            <button
              onClick={handleUseDetected}
              className="bg-blue-600 text-white px-3 py-2 rounded mr-2"
            >
              Enviar {selectedToken}
            </button>
            <button
              onClick={() => setDetected(null)}
              className="bg-gray-300 px-3 py-2 rounded"
            >
              Escanear otro
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Ningún destino detectado aún.</p>
      )}

      <hr className="my-3" />

      <div>
        <p className="text-sm">También puedes ingresar manualmente:</p>
        <ManualSendForm onSend={enviarPago} selectedToken={selectedToken} />
      </div>
    </div>
  );
};

// === FORMULARIO MANUAL ===
const ManualSendForm = ({
  onSend,
  selectedToken,
}: {
  onSend: (to: string, amount?: string) => Promise<any>;
  selectedToken: "MD" | "WLD" | "USDC";
}) => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const submit = async () => {
    if (!isAddress(to)) {
      alert("Dirección inválida");
      return;
    }
    await onSend(to, amount || undefined);
  };
  return (
    <div className="mt-2">
      <input
        placeholder="Dirección destino"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        placeholder={`Monto ${selectedToken} (ej: 1.5)`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={submit} className="bg-blue-600 text-white px-3 py-2 rounded">
        Enviar {selectedToken}
      </button>
    </div>
  );
};
