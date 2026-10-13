import type {NextConfig} from 'next';
const config:NextConfig={output:'standalone',poweredByHeader:false,images:{unoptimized:true},experimental:{cpus:2},serverExternalPackages:['node:sqlite']};
export default config;
