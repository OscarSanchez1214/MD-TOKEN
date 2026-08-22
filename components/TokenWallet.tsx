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

interface Props {
  userWalletAddress: `0x${string}`
}

export default function TokenWallet({ userWalletAddress }: Props) {
  const [balance, setBalance] = useState('0')
  const [symbol, setSymbol] = useState('MD')
  const [decimals, setDecimals] = useState(18)
  const [loading, setLoading] = useState(true)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [sending, setSending] = useState(false)

  async function fetchBalance() {
    setLoading(true)
    try {
      const data = await getTokenDetails(userWalletAddress)
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

  useEffect(() => {
    if (userWalletAddress) fetchBalance()
  }, [userWalletAddress])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTxStatus('Solicitando confirmación en World App...')

    try {
      // 1. Verificamos que MiniKit esté activo en el celular
      if (!MiniKit.isInstalled()) {
        throw new Error('Abre esta app desde World App para autorizar el envío.')
      }

      // 2. Convertimos el monto que escribe el usuario a formato "Wei" (matemática de Blockchain)
      const amountInWei = parseUnits(amount, decimals).toString()

      // 3. ¡LA MAGIA DE MINIKIT! Esto abre la pantalla para que el usuario firme
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

      // 4. Verificamos qué decidió el usuario
      if (finalPayload.status === 'success') {
        setTxStatus('¡Envío exitoso! Procesando en la red...')
        setAmount('')
        setRecipient('')
        
        // Esperamos 4 segundos para que la blockchain registre el movimiento y recargamos el saldo
        setTimeout(() => {
          fetchBalance()
          setTxStatus('Saldo actualizado.')
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
    <main className="wallet">
      <section className="card balance">
        <small>Balance</small>
        <h1>{loading ? 'Cargando…' : `${balance} ${symbol}`}</h1>
        <p className="contract">Contrato: {MY_TOKEN_ADDRESS}</p>
      </section>

      <section className="card">
        <h2>Enviar {symbol}</h2>
        <form onSubmit={handleSend}>
          <label>Dirección destino</label>
          <input
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="0x..."
            required
          />
          <label>Monto</label>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            type="number"
            min="0"
            step="any"
            placeholder="0.0"
            required
          />
          <button disabled={sending}>
            {sending ? 'Procesando…' : `Enviar ${symbol}`}
          </button>
        </form>
        {txStatus && <p className="status">{txStatus}</p>}
      </section>

      <section className="card">
        <h2>Recibir {symbol}</h2>
        <p>Comparte esta dirección para recibir Token MD:</p>
        <div className="address">{userWalletAddress}</div>
      </section>
    </main>
  )
}
