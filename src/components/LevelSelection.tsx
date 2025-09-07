import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, PlayCircle, Lock, Clock } from 'lucide-react';
import { Page } from '../App';
import { levels } from './levels';
import { getCurrentUser } from './regis';

interface LevelSelectionProps {
    onNavigate: (page: Page) => void;
    onSelectLevel: (level: number | string) => void;
    difficulty: 'easy' | 'medium' | 'hard' | 'custom';
}

export function LevelSelection({ onNavigate, onSelectLevel, difficulty }: LevelSelectionProps) {
    const difficultyLevels = difficulty === 'custom' ? 
        (JSON.parse(localStorage.getItem('customLevels') || '[]')) : 
        levels[difficulty];
    const currentUser = getCurrentUser();

    const handleLevelSelect = (levelId: number | string) => {
        onSelectLevel(levelId);
        onNavigate('game');
    };

    // 检查关卡是否有保存的进度
    const hasSavedGame = (levelId: number | string) => {
        if (!currentUser) return false;
        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${levelId}`;
        return !!localStorage.getItem(saveKey);
    };

    // 获取保存时间
    const getSaveTime = (levelId: number | string) => {
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

                {difficulty === 'custom' && difficultyLevels.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎮</div>
                        <h2 className="text-2xl font-bold mb-4">自定义关卡</h2>
                        <p className="text-muted-foreground mb-6">
                            您还没有创建任何自定义关卡。请先使用关卡编辑器创建您的专属拼图！
                        </p>
                        <Button 
                            onClick={() => onNavigate('puzzleEditor')}
                            className="bg-primary hover:bg-primary/90"
                        >
                            创建自定义关卡
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {difficultyLevels.map((level: any) => {
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
                                        <CardTitle>{difficulty === 'custom' ? level.name : `第 ${level.id} 关`}</CardTitle>
                                        <CardDescription>
                                            {difficulty === 'custom' ? 
                                                `${level.rows}×${level.cols} - ${level.pieceShape === 'regular' ? '规则形状' : '不规则形状'}` : 
                                                level.name
                                            }
                                        </CardDescription>
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
                )}
            </div>
        </div>
    );
}
