// app/blog/page.tsx
"use client";
import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Recomendaciones Financieras</h1>

      <div className="space-y-8">
        <article>
          <h2 className="text-xl font-semibold">1. Crea un fondo de emergencia</h2>
          <p>Destina al menos 3-6 meses de tus gastos mensuales en una cuenta accesible. Te ayudará a afrontar imprevistos sin endeudarte.</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">2. No gastes más de lo que ganas</h2>
          <p>Haz un presupuesto mensual. Prioriza necesidades antes que deseos. Vive por debajo de tus posibilidades para poder ahorrar.</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">3. Invierte a largo plazo</h2>
          <p>Usa instrumentos como fondos indexados o ETF. Cuanto antes empieces, más crecerá tu dinero gracias al interés compuesto.</p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">4. Visita nuestro blog</h2>
        </article>

        <a
          href="https://edicionesmd.com/publicaciones/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Donar con World App
        </a>
      </div>

      <div className="mt-10">
        <a
          href="https://edicionesmd.com/producto/apoyar-al-autor-de-este-blog/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Donar con World App
        </a>
      </div>

      <div className="mt-6">
        <Link href="/">
          <span className="text-blue-600 hover:underline">← Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
