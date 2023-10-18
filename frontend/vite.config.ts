import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [react()],
	define: {
		BACKEND_BASE_URL: JSON.stringify('http://localhost:5173'),
	},
	...('serve' === command ? ({
		server: {
			proxy: {
				'/api': {
					target: 'http://localhost:3000',
					changeOrigin: true,
					secure: false,
					ws: true,
					rewrite: path => path,
					configure: (proxy, _options) => {
						proxy.on('error', (err, _req, _res) => {
							console.log('proxy error', err);
						});
						proxy.on('proxyReq', (proxyReq, req, _res) => {
							console.log('backend -> :', req.method, req.url);
						});
						proxy.on('proxyRes', (proxyRes, req, _res) => {
							console.log('backend <- :', proxyRes.statusCode, req.url);
						});
					},
				},
			},
		},
	}): ({})),
}));

