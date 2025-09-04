import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
		colors: {
			border: '#404040',
			input: '#262626',
			ring: '#00d4ff',
			background: {
				DEFAULT: '#0f0f0f',
				secondary: '#1a1a1a',
				tertiary: '#262626',
			},
			foreground: '#f8fafc',
			primary: {
				DEFAULT: '#00d4ff',
				glow: '#33ddff',
				dark: '#0099cc',
				foreground: '#0f0f0f'
			},
			secondary: {
				DEFAULT: '#1a1a1a',
				foreground: '#f8fafc'
			},
			success: {
				DEFAULT: '#22c55e',
				glow: '#4ade80',
			},
			warning: {
				DEFAULT: '#eab308',
				glow: '#fbbf24',
			},
			danger: {
				DEFAULT: '#ef4444',
				glow: '#f87171',
			},
			glass: {
				DEFAULT: 'rgba(26, 26, 26, 0.8)',
				border: 'rgba(248, 250, 252, 0.1)',
				hover: 'rgba(38, 38, 38, 0.9)',
			},
			muted: {
				DEFAULT: '#525252',
				foreground: '#a3a3a3'
			},
			accent: {
				DEFAULT: '#00d4ff',
				foreground: '#0f0f0f'
			},
			card: {
				DEFAULT: 'rgba(26, 26, 26, 0.8)',
				border: 'rgba(248, 250, 252, 0.08)',
				hover: 'rgba(38, 38, 38, 0.9)',
				foreground: '#f8fafc'
			},
		},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-glow': 'var(--gradient-glow)',
			},
			boxShadow: {
				glow: 'var(--shadow-glow)',
				card: 'var(--shadow-card)',
				elevated: 'var(--shadow-elevated)',
			},
			transitionTimingFunction: {
				smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
				bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
