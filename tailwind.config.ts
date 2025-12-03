
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./views/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./App.tsx",
    ],
    darkMode: 'class',
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
                    DEFAULT: '#000000', // Pure black for borders
                    light: '#333333',
                },
                pop: {
                    yellow: '#FFD700', // Main brand color
                    blue: '#87CEEB',
                    purple: '#E6E6FA',
                    green: '#90EE90',
                    pink: '#FFB6C1',
                },
                cyber: {
                    black: '#050505',
                    gray: '#1a1a1a',
                },
                neon: {
                    yellow: '#E2F546',
                    pink: '#FF00FF',
                    blue: '#00FFFF',
                    green: '#39FF14',
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
                mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'], // Added monospace font
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
                'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
                'neo-xs': '1px 1px 0px 0px rgba(0,0,0,1)', // Added for mobile
                'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
            },
            borderWidth: {
                '3': '3px',
            }
        },
    },
    plugins: [],
};
export default config;
