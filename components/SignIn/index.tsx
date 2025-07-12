'use client';

import { useSession, signOut } from 'next-auth/react';

export function SignIn() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center text-center">
        <img
          src="https://edicionesmd.com/wp-content/uploads/2024/03/MDLogo2-150x150.webp"
          alt="Logo Mundo Didáctico"
          className="mb-4 w-32 h-32"
        />
        <h1 className="text-3xl font-bold">MUNDO DIDÁCTICO</h1>
        <p className="text-lg text-gray-700 mb-4">Educación Emocional y Financiera</p>

        <a
          href="https://edicionesmd.com/entrar/?redirect_to=https%3A%2F%2Fedicionesmd.com%2F"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Iniciar sesión en MD
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-2">Sesión iniciada como: {session.user?.name}</p>
      <button
        onClick={() => signOut()}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
