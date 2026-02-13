/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#4F46E5',
                    light: '#6366F1',
                    dark: '#4338CA',
                },
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
                mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                card: '0 2px 8px rgba(0, 0, 0, 0.08)',
                panel: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
        },
    },
    plugins: [],
}
