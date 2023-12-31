import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [ react() ],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
			},
			'/socket.io': {
				target: 'http://localhost:3000',
				ws: true,
			},
			'/static': {
				target: 'http://localhost:3000',
			},
		},
	},
});
