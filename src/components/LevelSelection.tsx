import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, PlayCircle, Lock, Clock } from 'lucide-react';
import { Page } from '../App';
import { levels } from './levels';
import { getCurrentUser } from './regis';

interface LevelSelectionProps {
    onNavigate: (page: Page) => void;
    onSelectLevel: (level: number) => void;
    difficulty: 'easy' | 'medium' | 'hard';
}

export function LevelSelection({ onNavigate, onSelectLevel, difficulty }: LevelSelectionProps) {
    const difficultyLevels = levels[difficulty];
    const currentUser = getCurrentUser();

    const handleLevelSelect = (levelId: number) => {
        onSelectLevel(levelId);
        onNavigate('game');
    };

    // 检查关卡是否有保存的进度
    const hasSavedGame = (levelId: number) => {
        if (!currentUser) return false;
        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${levelId}`;
        return !!localStorage.getItem(saveKey);
    };

    // 获取保存时间
    const getSaveTime = (levelId: number) => {
        if (!currentUser) return null;
        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${levelId}`;
        try {
            const savedData = localStorage.getItem(saveKey);
            if (!savedData) return null;

            const { timestamp } = JSON.parse(savedData);
            return new Date(timestamp);
        } catch (error) {
            return null;
        }
    };

    // 格式化时间
    const formatTime = (date: Date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="outline"
                        onClick={() => onNavigate('difficulty')}
                        className="bg-card/80 backdrop-blur-sm"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        返回难度选择
                    </Button>
                    <h1 className="text-4xl text-primary-foreground">
                        选择关卡 ({difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})
                    </h1>
                    <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {difficultyLevels.map((level, index) => {
                        const isUnlocked = true; // For now, all levels are unlocked. We can add logic later.
                        const hasSave = hasSavedGame(level.id);
                        const saveTime = hasSave ? getSaveTime(level.id) : null;

                        return (
                            <Card
                                key={level.id}
                                className={`overflow-hidden transition-transform transform hover:scale-105 ${isUnlocked ? 'cursor-pointer' : 'opacity-60'}`}
                                onClick={() => isUnlocked && handleLevelSelect(level.id)}
                            >
                                <div className="relative">
                                    <img src={level.imageUrl} alt={level.name} className="w-full h-40 object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        {isUnlocked ? (
                                            <PlayCircle className="size-12 text-white/80" />
                                        ) : (
                                            <Lock className="size-12 text-white/80" />
                                        )}
                                    </div>
                                    {hasSave && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                            <Clock className="size-3 mr-1" />
                                            有进度
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle>第 {level.id} 关</CardTitle>
                                    <CardDescription>{level.name}</CardDescription>
                                    {hasSave && saveTime && (
                                        <CardDescription className="text-xs">
                                            上次保存: {formatTime(saveTime)}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}