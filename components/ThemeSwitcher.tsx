'use client';

import { useState, useEffect } from 'react';
import { themes, getTheme, setTheme } from '@/lib/theme-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check, Sparkles } from 'lucide-react';

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState('indigo');
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        setCurrentTheme(getTheme());
    }, []);

    const handleThemeChange = (themeId: string) => {
        setIsChanging(true);
        setTheme(themeId);
        setCurrentTheme(themeId);

        // Add a small delay for visual feedback
        setTimeout(() => {
            setIsChanging(false);
        }, 300);
    };

    return (
        <Card className="glass border-border/60 shadow-lg">
            <CardHeader className="border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Palette className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Theme Customization</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Choose your preferred color scheme
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themes.map((theme) => {
                        const isActive = currentTheme === theme.id;

                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={`
                  relative group p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${isActive
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                        : 'border-border/60 hover:border-primary/50 hover:bg-secondary/50'
                                    }
                  ${isChanging && isActive ? 'scale-105' : 'hover:scale-[1.02]'}
                `}
                            >
                                {/* Color Preview */}
                                <div className="flex items-start gap-4 mb-3">
                                    <div
                                        className={`w-16 h-16 rounded-lg ${theme.preview} shadow-md ring-2 ring-white relative overflow-hidden`}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                                                <div className="p-1.5 bg-white rounded-full shadow-lg">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={`font-bold text-base mb-1 transition-colors ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                            }`}>
                                            {theme.name}
                                            {isActive && (
                                                <Sparkles className="inline w-4 h-4 ml-1.5 text-primary animate-pulse" />
                                            )}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {theme.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Color Swatches */}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                                    <div
                                        className="w-6 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                        style={{ backgroundColor: theme.primary }}
                                        title="Primary Color"
                                    />
                                    <div
                                        className="w-6 h-6 rounded-md shadow-sm ring-1 ring-black/5"
                                        style={{ backgroundColor: theme.secondary }}
                                        title="Secondary Color"
                                    />
                                    <span className="text-xs text-muted-foreground ml-auto self-center">
                                        {isActive ? 'Active' : 'Preview'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-secondary/30 border border-border/40 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Theme changes instantly
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your theme preference is saved automatically and will persist across sessions.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
