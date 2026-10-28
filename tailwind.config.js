import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    red: '#DC2626',
                    'red-hover': '#B91C1C',
                    'red-light': '#FEE2E2',
                    green: '#16A34A',
                    'green-dark': '#166534',
                    'green-light': '#DCFCE7',
                },
            },
        },
    },

    plugins: [forms],
};
