import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack(config) {
        config.resolve.alias['@'] = path.resolve(__dirname, 'app');
        return config;
    }
};

export default nextConfig;
