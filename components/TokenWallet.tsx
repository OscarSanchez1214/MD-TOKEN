'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { parseUnits } from 'viem'
import { MY_TOKEN_ADDRESS, getTokenDetails } from '@/lib/token'

// ABI mínimo necesario para que MiniKit sepa cómo ejecutar la función "transfer"
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
  // Manejamos la dirección internamente en lugar de exigirla por Props (Esto soluciona el error de Vercel)
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null)
  
  const [balance, setBalance] = useState('0')
  const [symbol, setSymbol] = useState('MD')
  const [decimals, setDecimals] = useState(18)
  const [loading, setLoading] = useState(true)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [sending, setSending] = useState(false)

  // 1. Extraemos la dirección automáticamente al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined' && MiniKit.isInstalled()) {
      const address = MiniKit.walletAddress;
      if (address) {
        setUserWalletAddress(address);
      }
    }
  }, [])

  // 2. Leemos el balance cuando ya tenemos la dirección
  useEffect(() => {
    async function fetchBalance() {
      if (!userWalletAddress) return;
      setLoading(true)
      try {
        const data = await getTokenDetails(userWalletAddress as `0x${string}`)
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

    if (userWalletAddress) {
      fetchBalance()
    }
  }, [userWalletAddress])

  // 3. Función nativa de MiniKit para enviar MD
  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTxStatus('Solicitando confirmación en World App...')

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('Abre esta app desde World App para autorizar el envío.')
      }
      if (!userWalletAddress) {
        throw new Error('No se ha detectado la billetera. Por favor inicia sesión primero.')
      }

      // Convertimos el monto que escribe el usuario a formato "Wei" (18 decimales)
      const amountInWei = parseUnits(amount, decimals).toString()

      // Inyectamos el comando de MiniKit para abrir la ventana de pago/envío de Worldcoin
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

      // Verificamos si el usuario aprobó con su huella/rostro
      if (finalPayload.status === 'success') {
        setTxStatus('¡Envío exitoso! Procesando en la red...')
        setAmount('')
        setRecipient('')
        
        // Esperamos 4 segundos y refrescamos el balance
        setTimeout(async () => {
          const data = await getTokenDetails(userWalletAddress as `0x${string}`)
          setBalance(data.balance)
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
    <main className="wallet max-w-md mx-auto space-y-6">
      <section className="card balance bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <small className="text-gray-500 font-semibold">Balance</small>
        <h1 className="text-4xl font-bold text-[#003A70] my-2">
          {loading ? 'Cargando…' : `${balance} ${symbol}`}
        </h1>
        <p className="contract text-[10px] text-gray-400 break-all">Contrato: {MY_TOKEN_ADDRESS}</p>
      </section>

      <section className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#003A70] mb-4">Enviar {symbol}</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dirección destino (World Chain)</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={!userWalletAddress}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Monto a transferir</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            className="w-full py-3 bg-[#013A72] text-white font-bold rounded-xl hover:bg-[#0154A0] disabled:bg-gray-400 transition-colors shadow-md"
          >
            {!userWalletAddress ? 'Billetera no detectada' : sending ? 'Procesando en World App…' : `Enviar ${symbol}`}
          </button>
        </form>
        {txStatus && (
          <p className={`status mt-4 text-sm text-center font-medium ${txStatus.includes('exitoso') ? 'text-green-600' : 'text-blue-600'}`}>
            {txStatus}
          </p>
        )}
      </section>

      <section className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-lg font-bold text-[#003A70] mb-2">Recibir {symbol}</h2>
        <p className="text-sm text-gray-500 mb-3">Tu dirección en World Chain:</p>
        <div className="address bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-800 break-all font-mono">
          {userWalletAddress || 'Cargando dirección o requiere iniciar sesión (SignIn)...'}
        </div>
      </section>
    </main>
  )
}
