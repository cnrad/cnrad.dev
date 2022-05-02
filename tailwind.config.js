module.exports = {
    content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 2s linear infinite',
            },
        },
    },
    plugins: [],
};
