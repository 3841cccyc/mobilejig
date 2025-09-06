import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Page } from '../App';
import { PuzzleGame } from './PuzzleGame';
import { getCurrentUser } from './regis'; // 导入获取当前用户的函数
import { submitScore } from './Leaderboard'; // 导入提交分数的函数
import { levels } from './levels'; // 导入关卡数据
import { useSettings } from '../context/SettingsContext';

interface GamePageProps {
    onNavigate: (page: Page) => void;
    difficulty: 'easy' | 'medium' | 'hard';
    level: number;
    onNextLevel: () => void;
}

const difficultySettings = {
      easy: { timeLimit: null, pointMultiplier: 1, gridSize: 3 },
      medium: { timeLimit: 300, pointMultiplier: 1.5, gridSize: 4 },
      hard: { timeLimit: 180, pointMultiplier: 2, gridSize: 5 }
};

const difficultyConfig = {
      easy: { color: 'bg-green-500', name: '简单 (3x3)' },
      medium: { color: 'bg-yellow-500', name: '中等 (4x4)' },
      hard: { color: 'bg-red-500', name: '困难 (5x5)' }
};

export function GamePage({ onNavigate, difficulty, level, onNextLevel }: GamePageProps) {
    const [timeLeft, setTimeLeft] = useState(difficultySettings[difficulty].timeLimit);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'paused' | 'completed' | 'gameOver'>('playing');
    const [moves, setMoves] = useState(0);
    const [puzzleImageUrl, setPuzzleImageUrl] = useState<string>('');
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [completionTime, setCompletionTime] = useState(0);
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    const settings = difficultySettings[difficulty];
    const config = difficultyConfig[difficulty];
    
    // 使用设置上下文
    const { isMusicOn, playBackgroundMusic, stopBackgroundMusic } = useSettings();
    
    // Check if there's a next level available
    const hasNextLevel = level < levels[difficulty].length;

    // 检查用户登录状态
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);

        // 如果用户未登录，提示并返回主页
        if (!user) {
            alert('请先登录后再开始游戏');
            onNavigate('home');
        }
    }, []);

    // Load puzzle image based on selected level
    useEffect(() => {
        const loadPuzzleImage = () => {
            try {
                // Get the selected level from levels data
                const levelData = levels[difficulty].find(l => l.id === level);
                if (levelData && levelData.imageUrl) {
                    setPuzzleImageUrl(levelData.imageUrl);
                } else {
                    // Fallback to first level if not found
                    setPuzzleImageUrl(levels[difficulty][0].imageUrl);
                }
            } catch (error) {
                console.error('Failed to load puzzle image:', error);
                // Use a solid color fallback
                setPuzzleImageUrl('');
            }
        };

        loadPuzzleImage();
    }, [difficulty, level]);
     
    // 背景音乐控制
     useEffect(() => {
        if (isMusicOn && gameState === 'playing' && !isPaused) {
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }
    }, [isMusicOn, gameState, isPaused, playBackgroundMusic, stopBackgroundMusic]);
      // Timer effect
      useEffect(() => {
            if (gameState === 'playing' && timeLeft !== null && timeLeft > 0) {
                  const timer = setTimeout(() => {
                        setTimeLeft(prev => prev! - 1);
                  }, 1000);
                  return () => clearTimeout(timer);
            } else if (timeLeft === 0) {
                  setGameState('gameOver');
            }
      }, [timeLeft, gameState]);

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '无时间限制';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePauseMenuAction = (action: 'home' | 'difficulty') => {
        if (action === 'home') {
            onNavigate('home');
        } else {
            onNavigate('difficulty');
        }
        setIsPaused(false);
    };

      const handleGameComplete = (score: number, totalMoves: number, timeElapsed: number) => {
            setMoves(totalMoves);
        setFinalScore(score);
        setCompletionTime(timeElapsed);
            setFinalScore(score);
        setCompletionTime(timeElapsed);
        setGameState('completed');

        // 使用当前用户信息自动提交分数
        if (currentUser) {
            const level = Math.max(1, Math.floor(score / 5000));
            const entered = submitScore(currentUser.username, score, difficulty, level);

            setShowCompletionDialog(true);
        }
    };

    const handleNavigate = (page: 'home' | 'difficulty' | 'editorDifficulty') => {
        if (page === 'home') {
            onNavigate('home');
        } else if (page === 'difficulty') {
            onNavigate('difficulty');
        }
    };

    const handleNextLevel = () => {
        if (hasNextLevel) {
            setShowCompletionDialog(false);
            onNextLevel();
        }
    };

    if (gameState === 'gameOver') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl">⏰ 时间到！</h1>
                    <p className="text-muted-foreground">很遗憾，时间用完了。</p>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => window.location.reload()}>
                            再试一次
                        </Button>
                        <Button onClick={() => onNavigate('difficulty')} variant="outline">
                            更改难度
                        </Button>
                        <Button onClick={() => onNavigate('home')} variant="ghost">
                            返回主页
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Timer and Top Controls */}
            <div className="flex justify-between items-center p-4 bg-card/90 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Badge className={`${config.color} text-white`}>
                        {config.name}
                    </Badge>
                    <div className="text-sm">
                        步数: {moves}
                    </div>
                    {currentUser && (
                        <div className="text-sm text-muted-foreground">
                            玩家: {currentUser.username}
                        </div>
                    )}
                </div>

                <div className="text-2xl font-mono text-primary">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPaused(true)}
                        className="bg-card/80 backdrop-blur-sm"
                    >
                        <Pause className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-card/80 backdrop-blur-sm"
                    >
                        {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                    </Button>
                </div>
            </div>

            {/* Main Game Area */}
            <PuzzleGame
                gridSize={settings.gridSize}
                imageUrl={puzzleImageUrl}
                onComplete={handleGameComplete}
                onNavigate={handleNavigate}
                difficulty={difficulty}
            />

            {/* Pause Menu Dialog */}
            <Dialog open={isPaused} onOpenChange={setIsPaused}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>游戏暂停</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Button
                            onClick={() => handlePauseMenuAction('home')}
                            variant="outline"
                            className="w-full"
                        >
                            返回主页
                        </Button>
                        <Button
                            onClick={() => handlePauseMenuAction('difficulty')}
                            variant="outline"
                            className="w-full"
                        >
                            返回难度选择
                        </Button>
                        <Button
                            onClick={() => setIsPaused(false)}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            继续游戏
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Completion Dialog */}
            <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>🎉 恭喜完成游戏！</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {currentUser && (
                            <p className="text-lg">
                                恭喜 <span className="font-bold text-primary">{currentUser.username}</span> 获得
                                <span className="font-bold text-primary"> {finalScore.toLocaleString()} </span>
                                分！
                            </p>
                        )}
                        <div className="space-y-2 text-sm">
                            <p>用时: {completionTime} 秒</p>
                            <p>步数: {moves}</p>
                            <p>难度: {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <div className="flex flex-col gap-2 w-full">
                            {hasNextLevel && (
                                <Button
                                    onClick={handleNextLevel}
                                    className="w-full"
                                    variant="outline"
                                    size="lg"
                                >
                                    下一关 (第 {level + 1} 关)
                                </Button>
                            )}
                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    再玩一次
                                </Button>
                                <Button
                                    onClick={() => onNavigate('leaderboard')}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    查看排行榜
                                </Button>
                                <Button
                                    onClick={() => onNavigate('home')}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    返回主页
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}