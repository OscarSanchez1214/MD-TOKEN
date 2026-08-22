'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { parseUnits } from 'viem'
import { MY_TOKEN_ADDRESS, getTokenDetails } from '@/lib/token'

const MINIMAL_ERC20_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function TokenWallet() {
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')
  const [symbol, setSymbol] = useState('MD')
  const [decimals, setDecimals] = useState(18)
  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [sending, setSending] = useState(false)

  // Intentar capturar la dirección automáticamente de MiniKit
  const detectarBilletera = () => {
    if (typeof window !== 'undefined' && MiniKit.isInstalled()) {
      const address = MiniKit.walletAddress;
      if (address) {
        setUserWalletAddress(address);
        fetchBalance(address as `0x${string}`);
      }
    }
  }

  useEffect(() => {
    detectarBilletera();
    // Reintentar a los 2 segundos por si MiniKit tarda en inyectar la sesión
    const timer = setTimeout(detectarBilletera, 2000);
    return () => clearTimeout(timer);
  }, [])

  async function fetchBalance(address: `0x${string}`) {
    setLoading(true)
    try {
      const data = await getTokenDetails(address)
      setBalance(data.balance)
      setSymbol(data.symbol)
      setDecimals(data.decimals)
    } catch (e) {
      console.error(e)
      setTxStatus('No se pudo consultar el balance.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTxStatus('Solicitando confirmación en World App...')

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('Abre esta app desde World App para autorizar el envío.')
      }
      if (!userWalletAddress) {
        throw new Error('Realiza primero el Sign-In para conectar tu billetera.')
      }

      const amountInWei = parseUnits(amount, decimals).toString()

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: MY_TOKEN_ADDRESS,
            abi: MINIMAL_ERC20_ABI,
            functionName: 'transfer',
            args: [recipient, amountInWei]
          }
        ]
      })

      if (finalPayload.status === 'success') {
        setTxStatus('¡Envío exitoso! Procesando en la red...')
        setAmount('')
        setRecipient('')
        
        setTimeout(async () => {
          if (userWalletAddress) await fetchBalance(userWalletAddress as `0x${string}`)
          setTxStatus('Saldo actualizado exitosamente.')
        }, 4000)
      } else {
        setTxStatus('Transacción rechazada o cancelada por el usuario.')
      }

    } catch (e: any) {
      console.error(e)
      setTxStatus(`Error: ${e?.message || 'Operación cancelada'}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="wallet space-y-4 text-left">
      <section className="card balance bg-blue-50 p-4 rounded-xl text-center">
        <small className="text-gray-500 text-xs uppercase font-semibold">Balance</small>
        <h1 className="text-3xl font-bold text-[#003A70] my-1">
          {loading ? 'Cargando…' : `${balance} ${symbol}`}
        </h1>
        <p className="contract text-[9px] text-gray-400 break-all">Contrato: {MY_TOKEN_ADDRESS}</p>
      </section>

      <section className="card bg-white p-4 rounded-xl border border-gray-200">
        <h2 className="text-sm font-bold text-[#003A70] mb-3">Enviar {symbol}</h2>
        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Dirección destino (World Chain)</label>
            <input
              className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={!userWalletAddress}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Monto a transferir</label>
            <input
              className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              type="number"
              min="0"
              step="any"
              placeholder="0.0"
              disabled={!userWalletAddress}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={sending || !userWalletAddress}
            className="w-full py-2.5 bg-[#013A72] text-white text-sm font-bold rounded-xl hover:bg-[#0154A0] disabled:bg-gray-300 transition-colors shadow-sm"
          >
            {!userWalletAddress ? 'Billetera no detectada (Haz SignIn arriba)' : sending ? 'Procesando en World App…' : `Enviar ${symbol}`}
          </button>
        </form>
        {txStatus && (
          <p className={`status mt-3 text-xs text-center font-medium ${txStatus.includes('exitoso') ? 'text-green-600' : 'text-blue-600'}`}>
            {txStatus}
          </p>
        )}
      </section>

      <section className="card bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
        <h2 className="text-xs font-bold text-[#003A70] mb-1">Recibir {symbol}</h2>
        <p className="text-[11px] text-gray-500 mb-2">Tu dirección en World Chain:</p>
        <div className="address bg-white p-2 rounded border border-gray-200 text-[11px] text-gray-800 break-all font-mono">
          {userWalletAddress || '⚠️ Presiona primero el botón de "SignIn" (arriba) para ver tu dirección y saldo.'}
        </div>
      </section>
    </main>
  )
}
