/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: [
      'images.openfoodfacts.org',
      'world.openfoodfacts.org',
      'static.openfoodfacts.org',
      'www.themealdb.com',
      'spoonacular.com',
      'api.spoonacular.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
}

module.exports = nextConfig
