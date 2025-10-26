"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function SignIn() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center text-center">
        {/* Imagen externa solicitada */}
        <img
          src="https://edicionesmd.com/wp-content/uploads/2024/03/MDLogo2-150x150.webp"
          alt="Logo Mundo Didáctico"
          className="mb-4 w-32 h-32"
        />

        <h1 className="text-3xl font-bold">MUNDO DIDÁCTICO</h1>
        <p className="text-lg text-gray-700 mb-4">Educación Emocional y Financiera</p>

        {/* Botón local de inicio de sesión (next-auth) — no abre enlaces externos */}
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          aria-label="Iniciar sesión"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-2">Sesión iniciada como: {session.user?.name ?? session.user?.email}</p>
      <button
        onClick={() => signOut()}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
