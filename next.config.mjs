import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack(config) {
        config.resolve.alias['@'] = path.resolve(__dirname, 'app');
        return config;
    },
};

export default nextConfig;