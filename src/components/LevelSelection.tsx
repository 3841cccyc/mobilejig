import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, PlayCircle, Lock, Clock, Trash2, Settings } from 'lucide-react';
import { Page } from '../App';
import { levels } from './levels';
import { getCurrentUser } from './regis';

interface LevelSelectionProps {
    onNavigate: (page: Page) => void;
    onSelectLevel: (level: number | string) => void;
    onPlayLevel?: (levelId: number | string) => void;
    difficulty: 'easy' | 'medium' | 'hard' | 'custom';
}

export function LevelSelection({ onNavigate, onSelectLevel, onPlayLevel, difficulty }: LevelSelectionProps) {
    const [customLevels, setCustomLevels] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isManageMode, setIsManageMode] = useState(false);
    
    const currentUser = getCurrentUser();

    // 加载自定义关卡
    useEffect(() => {
        if (difficulty === 'custom') {
            const levels = JSON.parse(localStorage.getItem('customLevels') || '[]');
            setCustomLevels(levels);
        }
    }, [difficulty, refreshKey]);

    const handleLevelSelect = (levelId: number | string) => {
        if (onPlayLevel) {
            // 使用专门的游玩函数
            onPlayLevel(levelId);
        } else {
            // 备用方案
            onSelectLevel(levelId);
            onNavigate('game');
        }
    };

    const handleDeleteCustomLevel = (levelId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止触发卡片的点击事件
        
        if (confirm('确定要删除这个自定义关卡吗？此操作无法撤销。')) {
            const currentLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
            const updatedLevels = currentLevels.filter((level: any) => level.id !== levelId);
            localStorage.setItem('customLevels', JSON.stringify(updatedLevels));
            
            // 更新状态以重新渲染组件
            setCustomLevels(updatedLevels);
            setRefreshKey(prev => prev + 1);
        }
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

    const difficultyLevels = difficulty === 'custom' ? customLevels : levels[difficulty];

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
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

                    {/* 管理按钮 - 只在自定义关卡时显示 */}
                    {difficulty === 'custom' && (
                        <Button
                            variant={isManageMode ? "default" : "outline"}
                            onClick={() => setIsManageMode(!isManageMode)}
                            className="bg-card/80 backdrop-blur-sm"
                        >
                            <Settings className="size-4 mr-2" />
                            {isManageMode ? '退出管理' : '管理关卡'}
                        </Button>
                    )}
                </div>

                {/* 管理模式提示 */}
                {isManageMode && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">管理模式已开启</p>
                        <p className="text-sm">点击垃圾桶图标可以删除关卡，点击编辑图标可以修改关卡</p>
                    </div>
                )}

                {difficulty === 'custom' && customLevels.length === 0 ? (
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
                            const isUnlocked = true;
                            const hasSave = hasSavedGame(level.id);
                            const saveTime = hasSave ? getSaveTime(level.id) : null;

                            return (
                                <Card
                                    key={level.id}
                                    className={`overflow-hidden transition-transform transform hover:scale-105 ${isUnlocked ? 'cursor-pointer' : 'opacity-60'
                                        } ${isManageMode ? 'border-2 border-dashed border-blue-300' : ''}`}
                                    onClick={() => handleLevelSelect(level.id)}
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
                                        {difficulty === 'custom' && (
                                            <Button
                                                onClick={(e: React.MouseEvent) => handleDeleteCustomLevel(level.id, e)}
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 left-2 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
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

                {/* 操作按钮组 */}
                <div className="flex justify-center gap-4 mt-8">
                    {difficulty === 'custom' && (
                        <Button
                            onClick={() => onNavigate('puzzleEditor')}
                            variant="outline"
                            className="bg-card/80 backdrop-blur-sm"
                        >
                            创建新关卡
                        </Button>
                    )}
                    <Button
                        onClick={() => onNavigate('difficulty')}
                        variant="outline"
                        className="bg-card/80 backdrop-blur-sm"
                    >
                        选择其他难度
                    </Button>
                </div>
            </div>
        </div>
    );
}