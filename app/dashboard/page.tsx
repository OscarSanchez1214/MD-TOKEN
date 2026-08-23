'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link' // <-- 1. Importamos Link de Next.js
import {
  MY_TOKEN_ADDRESS,
  getTokenDetails,
  sendMyToken,
} from '@/lib/token'

interface Props {
  userWalletAddress: `0x${string}`
}

type ModalType = 'send' | 'receive' | null

export default function TokenWallet({
  userWalletAddress,
}: Props) {
  const [balance, setBalance] = useState('0')
  const [symbol, setSymbol] = useState('MD')
  const [decimals, setDecimals] = useState(18)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const [modal, setModal] = useState<ModalType>(null)

  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] =
    useState<'success' | 'error' | 'info'>('info')

  const [copied, setCopied] = useState(false)

  // --------------------------------------------------
  // CARGAR BALANCE
  // --------------------------------------------------

  async function loadBalance() {
    try {
      setRefreshing(true)

      const data = await getTokenDetails(
        userWalletAddress
      )

      setBalance(data.balance)
      setSymbol(data.symbol)
      setDecimals(data.decimals)
    } catch (error) {
      console.error('Error consultando balance:', error)

      setStatus(
        'No fue posible consultar el balance del Token MD.'
      )

      setStatusType('error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (userWalletAddress) {
      loadBalance()
    }
  }, [userWalletAddress])

  // --------------------------------------------------
  // COPIAR DIRECCIÓN
  // --------------------------------------------------

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(
        userWalletAddress
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setStatus(
        'No fue posible copiar la dirección.'
      )

      setStatusType('error')
    }
  }

  // --------------------------------------------------
  // COMPARTIR
  // --------------------------------------------------

  async function shareAddress() {
    const shareData = {
      title: 'Mi Wallet MD',
      text: `Mi dirección para recibir Token MD:\n\n${userWalletAddress}`,
    }

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.share
      ) {
        await navigator.share(shareData)
      } else {
        await copyAddress()

        setStatus(
          'Dirección copiada para compartir.'
        )

        setStatusType('success')
      }
    } catch (error) {
      console.log('Compartir cancelado:', error)
    }
  }

  // --------------------------------------------------
  // VALIDAR DIRECCIÓN
  // --------------------------------------------------

  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // --------------------------------------------------
  // ABRIR ENVÍO
  // --------------------------------------------------

  function openSend() {
    setStatus('')
    setAmount('')
    setRecipient('')
    setModal('send')
  }

  // --------------------------------------------------
  // ABRIR RECEPCIÓN
  // --------------------------------------------------

  function openReceive() {
    setStatus('')
    setModal('receive')
  }

  // --------------------------------------------------
  // CONFIRMAR ENVÍO
  // --------------------------------------------------

  async function confirmSend() {
    setStatus('')

    if (!isValidAddress(recipient)) {
      setStatus(
        'La dirección de destino no es válida.'
      )

      setStatusType('error')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setStatus(
        'Introduce un monto mayor que cero.'
      )

      setStatusType('error')
      return
    }

    const numericAmount = Number(amount)
    const numericBalance = Number(balance)

    if (numericAmount > numericBalance) {
      setStatus(
        'No tienes suficiente saldo disponible.'
      )

      setStatusType('error')
      return
    }

    setSending(true)

    setStatus(
      'Solicitando confirmación en World App...'
    )

    setStatusType('info')

    try {
      const txHash = await sendMyToken(
        recipient as `0x${string}`,
        amount,
        decimals
      )

      setStatus(
        `Transacción enviada correctamente.\n${txHash}`
      )

      setStatusType('success')

      setAmount('')
      setRecipient('')

      await loadBalance()

      setTimeout(() => {
        setModal(null)
      }, 2500)
    } catch (error: any) {
      console.error(error)

      setStatus(
        error?.message ||
          'La transacción fue rechazada.'
      )

      setStatusType('error')
    } finally {
      setSending(false)
    }
  }

  // --------------------------------------------------
  // FORMATEAR BALANCE
  // --------------------------------------------------

  function formatBalance(value: string) {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return value
    }

    return new Intl.NumberFormat(
      'es-CO',
      {
        maximumFractionDigits: 4,
      }
    ).format(number)
  }

  // --------------------------------------------------
  // DIRECCIÓN CORTA
  // --------------------------------------------------

  function shortAddress(address: string) {
    if (!address) return ''

    return `${address.slice(
      0,
      8
    )}...${address.slice(-6)}`
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <div className="md-wallet">

        {/* HEADER */}

        <header className="wallet-header">
          {/* 2. Envolvemos el logo y título con <Link> */}
          <Link 
            href="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              textDecoration: 'none', 
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            <div className="wallet-logo">
              MD
            </div>

            <div>
              <h1>Wallet MD</h1>

              <span>
                World Chain
              </span>
            </div>
          </Link>

          <button
            className="header-refresh"
            onClick={loadBalance}
            disabled={refreshing}
            aria-label="Actualizar balance"
          >
            {refreshing ? '...' : '↻'}
          </button>
        </header>

        {/* BALANCE */}

        <section className="balance-card">

          <div className="balance-top">
            <span>
              SALDO TOTAL
            </span>

            <span className="network">
              ● WORLD CHAIN
            </span>
          </div>

          <div className="balance-number">
            {loading
              ? '...'
              : formatBalance(balance)}
          </div>

          <div className="balance-symbol">
            {symbol}
          </div>

          <div className="wallet-address-small">
            {shortAddress(userWalletAddress)}
          </div>

        </section>

        {/* ACCIONES PRINCIPALES */}

        <section className="quick-actions">

          <button
            className="action-button send-action"
            onClick={openSend}
          >
            <span className="action-icon">
              ↑
            </span>

            <span>
              Enviar
            </span>
          </button>

          <button
            className="action-button receive-action"
            onClick={openReceive}
          >
            <span className="action-icon">
              ↓
            </span>

            <span>
              Recibir
            </span>
          </button>

        </section>

        {/* ACTIVIDAD */}

        <section className="activity-card">

          <div className="section-title">
            <h2>
              Actividad
            </h2>

            <span>
              Token {symbol}
            </span>
          </div>

          <div className="empty-activity">

            <div className="empty-icon">
              ↔
            </div>

            <strong>
              Sin movimientos recientes
            </strong>

            <p>
              Tus transacciones de Token MD
              aparecerán aquí.
            </p>

          </div>

        </section>

        {/* INFORMACIÓN */}

        <section className="info-card">

          <div className="info-row">

            <span>
              Red
            </span>

            <strong>
              World Chain
            </strong>

          </div>

          <div className="info-row">

            <span>
              Token
            </span>

            <strong>
              {symbol}
            </strong>

          </div>

          <div className="info-row">

            <span>
              Contrato
            </span>

            <strong className="contract-address">
              {shortAddress(
                MY_TOKEN_ADDRESS
              )}
            </strong>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="wallet-footer">
          Wallet MD · World Chain
        </footer>

      </div>

      {/* ================================================= */}
      {/* MODAL ENVIAR */}
      {/* ================================================= */}

      {modal === 'send' && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="modal-close"
              onClick={() => setModal(null)}
              disabled={sending}
            >
              ×
            </button>

            <div className="modal-icon">
              ↑
            </div>

            <h2>
              Enviar {symbol}
            </h2>

            <p className="modal-description">
              Envía Token MD a otra dirección
              de World Chain.
            </p>

            {/* DIRECCIÓN */}

            <label>
              Dirección destino
            </label>

            <div className="address-input">

              <input
                value={recipient}
                onChange={(e) =>
                  setRecipient(
                    e.target.value.trim()
                  )
                }
                placeholder="0x..."
                disabled={sending}
              />

              <button
                type="button"
                className="qr-button"
                disabled={sending}
                onClick={() => {
                  setStatus(
                    'El lector QR debe conectarse mediante la API de QR de MiniKit.'
                  )

                  setStatusType('info')
                }}
              >
                ▣
              </button>

            </div>

            <p className="input-help">
              Puedes introducir la dirección
              manualmente o escanear un QR.
            </p>

            {/* MONTO */}

            <label>
              Cantidad
            </label>

            <div className="amount-input">

              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="0.00"
                disabled={sending}
              />

              <span>
                {symbol}
              </span>

            </div>

            <button
              type="button"
              className="max-button"
              onClick={() => {
                setAmount(balance)
              }}
              disabled={sending}
            >
              Usar saldo completo
            </button>

            {/* ESTADO */}

            {status && (

              <div
                className={`status-box ${statusType}`}
              >
                {status}
              </div>

            )}

            {/* CONFIRMAR */}

            <button
              className="primary-button"
              onClick={confirmSend}
              disabled={sending}
            >
              {sending
                ? 'Procesando...'
                : `Enviar ${symbol}`}
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setModal(null)
              }
              disabled={sending}
            >
              Cancelar
            </button>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* MODAL RECIBIR */}
      {/* ================================================= */}

      {modal === 'receive' && (

        <div className="modal-overlay">

          <div className="modal receive-modal">

            <button
              className="modal-close"
              onClick={() =>
                setModal(null)
              }
            >
              ×
            </button>

            <div className="modal-icon receive">
              ↓
            </div>

            <h2>
              Recibir {symbol}
            </h2>

            <p className="modal-description">
              Escanea este código QR o comparte
              tu dirección para recibir Token MD.
            </p>

            {/* QR */}

            <div className="qr-container">

              <div className="qr-placeholder">

                <div className="qr-pattern">

                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />

                </div>

                <small>
                  QR WALLET MD
                </small>

              </div>

            </div>

            {/* DIRECCIÓN */}

            <div className="receive-address">

              <span>
                TU DIRECCIÓN
              </span>

              <strong>
                {shortAddress(
                  userWalletAddress
                )}
              </strong>

            </div>

            {/* BOTONES */}

            <div className="receive-buttons">

              <button
                onClick={copyAddress}
              >
                {copied
                  ? '✓ Copiado'
                  : '📋 Copiar'}
              </button>

              <button
                onClick={shareAddress}
              >
                ↗ Compartir
              </button>

            </div>

            <button
              className="secondary-button"
              onClick={() =>
                setModal(null)
              }
            >
              Cerrar
            </button>

          </div>

        </div>

      )}

    </>
  )
}
