module.exports = {
    content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'xs': '445px',
            },
            animation: {
                'spin-slow': 'spin 2s linear infinite',
            },
        },
    },
    plugins: [],
};
