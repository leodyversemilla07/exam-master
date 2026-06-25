import '../css/app.css';
import './bootstrap.ts';

import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });

            return pages[`./pages/${name}.tsx`] as never;
        },
        setup({ App, props }) {
            return <App {...props} />;
        },
    }),
);
