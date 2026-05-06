import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                background: "#050505",
                card: "#0F0F0F",

                accent: {
                    DEFAULT: "#6366f1",
                    foreground: "#ffffff"
                }
            },

            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem"
            },

            animation: {
                "fade-in-up": "fadeUp 0.4s ease-out",
            },

            keyframes: {
                fadeUp: {
                    from: {
                        opacity: "0",
                        transform: "translateY(10px)"
                    },
                    to: {
                        opacity: "1",
                        transform: "translateY(0)"
                    }
                }
            }
        }
    },
    plugins: [],
}

export default config
