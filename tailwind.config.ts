
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./views/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./App.tsx",
    ],
    theme: {
        extend: {
            colors: {
                cream: {
                    50: '#fbf9f6',
                    100: '#f5f0eb', // Card bg
                    200: '#ede0d4',
                    300: '#e0cbb6',
                    900: '#322f2e', // Dark bg
                },
                charcoal: {
                    DEFAULT: '#322f2e',
                    light: '#4a4543',
                },
                accent: {
                    green: '#4ade80',
                    purple: '#a78bfa',
                    blue: '#60a5fa',
                    yellow: '#facc15',
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-playfair)', 'serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
};
export default config;
