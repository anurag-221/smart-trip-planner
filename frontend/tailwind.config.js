/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/stores/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
        },
        app: {
          bg: "rgb(var(--bg-app) / <alpha-value>)",
          panel: "rgb(var(--bg-panel) / <alpha-value>)",
        },
        chat: {
          me: "rgb(var(--bg-message-me) / <alpha-value>)",
          other: "rgb(var(--bg-message-other) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        },
        tick: {
          sent: "rgb(var(--tick-sent) / <alpha-value>)",
          delivered: "rgb(var(--tick-delivered) / <alpha-value>)",
          seen: "rgb(var(--tick-seen) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};