import TokenWallet from "@/components/TokenWallet";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black">Plataforma Educativa MD</h1>
          {/* Aquí puedes agregar un botón de cerrar sesión en el futuro si lo deseas */}
        </header>

        {/* Aquí renderizamos la billetera */}
        <TokenWallet />

        {/* Aquí debajo puedes agregar el resto del contenido de tu plataforma, los módulos educativos, etc. */}
        <section className="mt-12 bg-white p-6 rounded-3xl border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-black">Tus Módulos</h2>
          <p className="text-gray-600">Bienvenido al área de aprendizaje. Pronto aparecerán tus recursos aquí.</p>
        </section>

      </div>
    </main>
  );
}
