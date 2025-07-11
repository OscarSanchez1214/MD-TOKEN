'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export function SignIn() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center">
        <p className="mb-2">No has iniciado sesión</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2">Sesión iniciada como: {session.user?.name}</p>
      <button
        onClick={() => signOut()}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
