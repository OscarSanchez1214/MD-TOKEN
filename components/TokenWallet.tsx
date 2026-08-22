'use client'

import { useEffect, useState } from 'react'
import { getTokenDetails, sendMyToken } from '@/lib/token'
import { MiniKit } from '@worldcoin/minikit-js'

export default function TokenWallet() {
  const [balance, setBalance] = useState<string>('0')
  const [symbol, setSymbol] = useState<string>('MD')
  const [decimals, setDecimals] = useState<number>(18)
  const [loading, setLoading] = useState<boolean>(true)
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [txStatus, setTxStatus] = useState<string>('')

  useEffect(() => {
    async function loadWalletData() {
      try {
        const walletAddress = MiniKit.walletAddress
        if (!walletAddress) {
          setLoading(false)
          return
        }

        const details = await getTokenDetails(walletAddress as `0x${string}`)
        setBalance(details.balance)
        setSymbol(details.symbol)
        setDecimals(details.decimals)
      } catch (error) {
        console.error('Error al cargar los detalles del token:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWalletData()
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    try {
      setTxStatus('Enviando transacción...')
      const resultHash = await sendMyToken(
        recipient as `0x${string}`,
        amount,
        decimals
      )
      setTxStatus(`¡Éxito! UserOpHash: ${resultHash.slice(0, 10)}...`)
      setRecipient('')
      setAmount('')
    } catch (error: any) {
      console.error(error)
      setTxStatus(`Error: ${error.message || 'No se pudo completar el envío'}`)
    }
  }

  if (loading) {
    return <p className="text-xs text-gray-500 text-center">Cargando saldo de tu billetera...</p>
  }

  return (
    <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 text-left">
      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
        <div>
          <p className="text-[11px] text-gray-500 uppercase font-semibold">Tu Saldo</p>
          <p className="text-lg font-bold text-[#013A72]">
            {balance} <span className="text-sm">{symbol}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">
            World Chain
          </span>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-2 pt-2 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700">Enviar Tokens {symbol}</p>
        
        <input
          type="text"
          placeholder="Dirección destino (0x...)"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#013A72] text-black"
          required
        />

        <input
          type="number"
          placeholder="Cantidad a enviar"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="any"
          className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#013A72] text-black"
          required
        />

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Transferir Tokens 💸
        </button>

        {txStatus && (
          <p className="text-[11px] text-blue-700 font-medium bg-blue-50 p-2 rounded border border-blue-100 break-all">
            {txStatus}
          </p>
        )}
      </form>
    </div>
  )
}
