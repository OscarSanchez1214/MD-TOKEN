/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Mejora rendimiento y depuración
  swcMinify: true,       // Usa el compilador rápido de Next.js
  eslint: {
    ignoreDuringBuilds: true, // Evita que el build falle si no está instalado ESLint
  },
  typescript: {
    ignoreBuildErrors: false, // Mantiene seguridad de tipos, pero puedes poner true si aún falla
  },
  compiler: {
    styledComponents: true, // Si en el futuro usas styled-components
  },
  experimental: {
    esmExternals: "loose", // Compatible con dependencias ESM modernas
  },
  webpack: (config) => {
    // Garantiza soporte para BigInt y librerías modernas
    config.experiments = { ...config.experiments, topLevelAwait: true, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
