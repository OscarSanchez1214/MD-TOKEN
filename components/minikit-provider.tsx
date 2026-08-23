'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // REEMPLAZA 'app_tu_codigo_aqui' por tu App ID real del Developer Portal (ej. app_123456...)
    const appId = process.env.NEXT_PUBLIC_APP_ID || 'app_tu_codigo_aqui' 
    
    if (!MiniKit.isInstalled()) {
      MiniKit.install(appId)
    }
  }, [])

  return <>{children}</>
}
