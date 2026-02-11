export const themes = [
    {
        id: 'indigo',
        name: 'Indigo Scholar',
        description: 'Professional and trustworthy - perfect for academic excellence',
        primary: '#6366F1',
        secondary: '#4F46E5',
        preview: 'bg-gradient-to-br from-indigo-500 to-indigo-700'
    },
    {
        id: 'emerald',
        name: 'Emerald Growth',
        description: 'Fresh and inspiring - symbolizes learning and progress',
        primary: '#10B981',
        secondary: '#059669',
        preview: 'bg-gradient-to-br from-emerald-500 to-emerald-700'
    },
    {
        id: 'violet',
        name: 'Violet Innovate',
        description: 'Creative and imaginative - for innovative thinkers',
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        preview: 'bg-gradient-to-br from-violet-500 to-violet-700'
    },
    {
        id: 'orange',
        name: 'Orange Energy',
        description: 'Bold and energetic - motivates active learning',
        primary: '#F97316',
        secondary: '#EA580C',
        preview: 'bg-gradient-to-br from-orange-500 to-orange-700'
    },
    {
        id: 'teal',
        name: 'Teal Modern',
        description: 'Contemporary and balanced - modern education',
        primary: '#14B8A6',
        secondary: '#0F766E',
        preview: 'bg-gradient-to-br from-teal-500 to-teal-700'
    },
    {
        id: 'rose',
        name: 'Rose Warm',
        description: 'Friendly and approachable - welcoming environment',
        primary: '#F43F5E',
        secondary: '#E11D48',
        preview: 'bg-gradient-to-br from-rose-500 to-rose-700'
    },
    {
        id: 'sky',
        name: 'Sky Blue',
        description: 'Clear and focused - promotes concentration',
        primary: '#0EA5E9',
        secondary: '#0284C7',
        preview: 'bg-gradient-to-br from-sky-500 to-sky-700'
    },
    {
        id: 'amber',
        name: 'Amber Sunshine',
        description: 'Warm and optimistic - positive learning atmosphere',
        primary: '#F59E0B',
        secondary: '#D97706',
        preview: 'bg-gradient-to-br from-amber-500 to-amber-700'
    }
];

export const getTheme = () => {
    if (typeof window === 'undefined') return 'indigo';
    return localStorage.getItem('app-theme') || 'indigo';
};

export const setTheme = (themeId: string) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('app-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
};

export const initTheme = () => {
    if (typeof window === 'undefined') return;

    const savedTheme = getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
};
