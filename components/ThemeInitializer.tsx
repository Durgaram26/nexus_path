'use client';

import { useEffect } from 'react';
import { initTheme } from '@/lib/theme-config';

export default function ThemeInitializer() {
    useEffect(() => {
        initTheme();
    }, []);

    return null;
}
