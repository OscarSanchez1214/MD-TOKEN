async function signInWithWallet() {
    if (!MiniKit.isInstalled()) {
      setErrorMsg('⚠️ MiniKit no detectado. Abre esta sección dentro de World App.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const nonce = crypto.randomUUID().replace(/-/g, '').substring(0, 10)

      const input = {
        nonce: nonce,
        // Quitamos las tildes por si World App es estricto con el formato
        statement: "Iniciar sesion en Billetera MD",
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }

      let result;
      
      // Compatibilidad dinámica: probamos cómo tu versión de MiniKit hace el llamado
      if (MiniKit.commandsAsync?.walletAuth) {
        result = await MiniKit.commandsAsync.walletAuth(input);
      } else if (MiniKit.commands?.walletAuth) {
        // @ts-ignore
        result = await MiniKit.commands.walletAuth(input);
      } else if ((MiniKit as any).walletAuth) {
        result = await (MiniKit as any).walletAuth(input);
      } else {
        throw new Error("Tu versión de MiniKit no soporta walletAuth o está mal inicializada.");
      }

      if (!result || result.executedWith === "fallback" || !result.data) {
        setErrorMsg('❌ Autenticación cancelada o ejecutada en modo fallback.')
        return
      }

      setWalletAddress(result.data.address)

    } catch (error: any) {
      console.error(error)
      // AHORA SÍ: Mostrará el error real en tu pantalla
      setErrorMsg(`❌ Error real: ${error?.message || String(error)}`)
    } finally {
      setLoading(false)
    }
  }
