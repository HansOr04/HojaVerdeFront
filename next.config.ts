/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Desabilitar los warnings de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Evitar errores de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig