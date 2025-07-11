'use client';
import { useState } from 'react';
import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';

export function VerifyBlock() {
  const [status, setStatus] = useState('Esperando verificación...');

  const verifyPayload = {
    action: 'voting-action',
    signal: '0x12312',
    verification_level: VerificationLevel.Orb,
  };

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setStatus('❌ MiniKit no está instalado. Abre esta MiniApp desde World App.');
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === 'error') {
        setStatus('❌ Verificación cancelada o fallida.');
        return;
      }

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload,
          action: verifyPayload.action,
          signal: verifyPayload.signal,
        }),
      });

      const result = await response.json();
      setStatus(result.status === 200 ? '✅ Verificación exitosa' : '❌ Verificación fallida');
    } catch (err) {
      console.error(err);
      setStatus('❌ Ocurrió un error en la verificación.');
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <h2 className="text-xl font-bold mb-2">Verificación de Identidad</h2>
      <p className="mb-2">{status}</p>
      <button
        onClick={handleVerify}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Verificar con World ID
      </button>
    </div>
  );
}
