import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Pause, Volume2, VolumeX, Save, Menu, RotateCcw, Undo2 } from 'lucide-react';
import { Page } from '../App';
import { MobilePuzzleGame } from './MobilePuzzleGame';
import { getCurrentUser } from './regis';
import { submitScore } from './Leaderboard';
import { levels } from './levels';
import { useSettings } from '../context/SettingsContext';
import { useMobileDetection } from '../hooks/useMobileDetection';

interface MobileGamePageProps {
    onNavigate: (page: Page) => void;
    difficulty: 'easy' | 'medium' | 'hard' | 'custom';
    level: number | string;
    onNextLevel: () => void;
    isPreviewMode?: boolean;
}

const difficultySettings = {
    easy: { timeLimit: null, pointMultiplier: 1, gridSize: 3 },
    medium: { timeLimit: 300, pointMultiplier: 1.5, gridSize: 4 },
    hard: { timeLimit: 180, pointMultiplier: 2, gridSize: 5 },
    custom: { timeLimit: null, pointMultiplier: 1.5, gridSize: 4 }
};

const difficultyConfig = {
    easy: { color: 'bg-green-500', name: '简单 (3x3)' },
    medium: { color: 'bg-yellow-500', name: '中等 (4x4)' },
    hard: { color: 'bg-red-500', name: '困难 (5x5)' },
    custom: { color: 'bg-purple-500', name: '自定义' }
};

interface GameSaveData {
    pieces: any[];
    puzzleGrid: any[][];
    moves: number;
    timeLeft: number | null;
    startTime: number;
    moveHistory: any[];
    difficulty: string;
    level: number | string;
    timestamp: number;
}

export function MobileGamePage({ onNavigate, difficulty, level, onNextLevel, isPreviewMode = false }: MobileGamePageProps) {
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
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    const [hasSavedGame, setHasSavedGame] = useState(false);
    const [isLoadingSavedGame, setIsLoadingSavedGame] = useState(false);
    const [customLevelData, setCustomLevelData] = useState<any>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const puzzleGameRef = useRef<any>(null);
    const { isMobile, isTablet, screenSize } = useMobileDetection();

    // 动态计算设置
    const settings = difficulty === 'custom' && customLevelData ? {
        timeLimit: null,
        pointMultiplier: 1.5,
        gridSize: Math.max(customLevelData.rows, customLevelData.cols)
    } : difficultySettings[difficulty];
    
    const config = difficultyConfig[difficulty];

    // 使用设置上下文
    const { isMusicOn, playBackgroundMusic, stopBackgroundMusic } = useSettings();

    // Check if there's a next level available
    const hasNextLevel = difficulty === 'custom' ? false : typeof level === 'number' && level < levels[difficulty as 'easy' | 'medium' | 'hard'].length;

    // 检查用户登录状态
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);

        if (!user) {
            alert('请先登录后再开始游戏');
            onNavigate('home');
            return;
        }

        checkForSavedGame();
    }, [difficulty, level]);

    // 检查是否有保存的游戏进度
    const checkForSavedGame = useCallback(() => {
        if (!currentUser) return;

        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${level}`;
        const savedGame = localStorage.getItem(saveKey);
        setHasSavedGame(!!savedGame);

        if (savedGame) {
            setShowLoadDialog(true);
        }
    }, [currentUser, difficulty, level]);

    // Load puzzle image based on selected level
    useEffect(() => {
        const loadPuzzleImage = () => {
            try {
                if (difficulty === 'custom') {
                    let customLevel = null;
                    
                    if (isPreviewMode) {
                        const tempPreviewLevel = localStorage.getItem('tempPreviewLevel');
                        if (tempPreviewLevel) {
                            customLevel = JSON.parse(tempPreviewLevel);
                        }
                    } else {
                        const customLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
                        customLevel = customLevels.find((l: any) => l.id === level);
                    }
                    
                    if (customLevel) {
                        setCustomLevelData(customLevel);
                        if (customLevel.imageUrl) {
                            setPuzzleImageUrl(customLevel.imageUrl);
                        } else {
                            setPuzzleImageUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop&crop=center');
                        }
                    } else {
                        console.error('Custom level not found:', level);
                        onNavigate('difficulty');
                        return;
                    }
                } else {
                    const levelData = levels[difficulty].find((l: any) => l.id === parseInt(level.toString()));
                    if (levelData && levelData.imageUrl) {
                        setPuzzleImageUrl(levelData.imageUrl);
                    } else {
                        setPuzzleImageUrl(levels[difficulty][0].imageUrl);
                    }
                }
            } catch (error) {
                console.error('Failed to load puzzle image:', error);
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

    // 保存游戏进度
    const saveGameProgress = useCallback((gameData: any) => {
        if (!currentUser) return false;

        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${level}`;
        const saveData: GameSaveData = {
            pieces: gameData.pieces,
            puzzleGrid: gameData.puzzleGrid,
            moves: gameData.moves,
            timeLeft: timeLeft,
            startTime: Date.now() - (timeLeft !== null ? (settings.timeLimit! - timeLeft) * 1000 : 0),
            moveHistory: gameData.moveHistory,
            difficulty,
            level,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            setHasSavedGame(true);
            alert('游戏进度已保存！');
            return true;
        } catch (error) {
            console.error('保存游戏进度失败:', error);
            alert('保存游戏进度失败，请重试');
            return false;
        }
    }, [currentUser, difficulty, level, timeLeft, settings.timeLimit]);

    // 加载游戏进度
    const loadGameProgress = useCallback(() => {
        if (!currentUser) return null;

        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${level}`;
        try {
            const savedData = localStorage.getItem(saveKey);
            if (!savedData) return null;

            return JSON.parse(savedData) as GameSaveData;
        } catch (error) {
            console.error('加载游戏进度失败:', error);
            return null;
        }
    }, [currentUser, difficulty, level]);

    // 删除保存的游戏进度
    const deleteSavedGame = useCallback(() => {
        if (!currentUser) return;

        const saveKey = `puzzle_game_save_${currentUser.username}_${difficulty}_${level}`;
        localStorage.removeItem(saveKey);
        setHasSavedGame(false);
    }, [currentUser, difficulty, level]);

    const handlePauseMenuAction = (action: 'home' | 'difficulty' | 'save') => {
        if (action === 'home') {
            onNavigate('home');
        } else if (action === 'difficulty') {
            onNavigate('difficulty');
        } else if (action === 'save') {
            if (puzzleGameRef.current) {
                puzzleGameRef.current.saveGame();
            }
        }
        setIsPaused(false);
        setShowMobileMenu(false);
    };

    const handleGameComplete = (score: number, totalMoves: number, timeElapsed: number) => {
        setMoves(totalMoves);
        setFinalScore(score);
        setCompletionTime(timeElapsed);
        setGameState('completed');

        deleteSavedGame();

        if (currentUser) {
            const level = Math.max(1, Math.floor(score / 5000));
            submitScore(currentUser.username, score, difficulty as 'easy' | 'medium' | 'hard', level);
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
            deleteSavedGame();
            setShowCompletionDialog(false);
            onNextLevel();
        }
    };

    // 处理加载游戏进度选择
    const handleLoadChoice = (loadSaved: boolean) => {
        setShowLoadDialog(false);

        if (loadSaved) {
            setIsLoadingSavedGame(true);
        } else {
            deleteSavedGame();
        }
    };

    if (gameState === 'gameOver') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl">⏰ 时间到！</h1>
                    <p className="text-muted-foreground">很遗憾，时间用完了。</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
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
            {/* Preview Mode Banner */}
            {isPreviewMode && (
                <div className="bg-yellow-500 text-white py-2 px-4">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <span className="font-medium text-sm">预览模式</span>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    const tempPreviewLevel = localStorage.getItem('tempPreviewLevel');
                                    if (tempPreviewLevel) {
                                        const previewData = JSON.parse(tempPreviewLevel);
                                        const newLevel = {
                                            id: `custom_${Date.now()}`,
                                            name: previewData.name,
                                            imageUrl: previewData.imageUrl,
                                            rows: previewData.rows,
                                            cols: previewData.cols,
                                            pieceShape: previewData.pieceShape,
                                            createdAt: new Date()
                                        };
                                        
                                        const customLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
                                        customLevels.push(newLevel);
                                        localStorage.setItem('customLevels', JSON.stringify(customLevels));
                                        
                                        localStorage.removeItem('tempPreviewLevel');
                                        alert('关卡保存成功！');
                                        onNavigate('puzzleEditor');
                                    }
                                }}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                                <Save className="size-3 mr-1" />
                                保存
                            </Button>
                            <Button
                                onClick={() => {
                                    localStorage.removeItem('tempPreviewLevel');
                                    onNavigate('puzzleEditor');
                                }}
                                size="sm"
                                variant="outline"
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                            >
                                返回
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-3 bg-card/90 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Badge className={`${config.color} text-white text-xs`}>
                        {isPreviewMode ? '预览' : config.name}
                    </Badge>
                    <div className="text-xs">
                        步数: {moves}
                    </div>
                </div>

                <div className="text-lg font-mono text-primary">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMobileMenu(true)}
                        className="bg-card/80 backdrop-blur-sm p-2"
                    >
                        <Menu className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Main Game Area */}
            {!puzzleImageUrl ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">加载中...</p>
                    </div>
                </div>
            ) : (
                <MobilePuzzleGame
                    ref={puzzleGameRef}
                    gridSize={settings.gridSize}
                    rows={difficulty === 'custom' && customLevelData ? customLevelData.rows : undefined}
                    cols={difficulty === 'custom' && customLevelData ? customLevelData.cols : undefined}
                    pieceShape={difficulty === 'custom' && customLevelData ? customLevelData.pieceShape : 'irregular'}
                    imageUrl={puzzleImageUrl}
                    onComplete={handleGameComplete}
                    onNavigate={handleNavigate}
                    difficulty={difficulty}
                    level={level}
                    hasSavedGame={hasSavedGame}
                    onSaveGame={saveGameProgress}
                    onLoadGame={loadGameProgress}
                    onDeleteSavedGame={deleteSavedGame}
                    isLoadingSavedGame={isLoadingSavedGame}
                    timeLeft={timeLeft}
                    setTimeLeft={setTimeLeft}
                    isPreviewMode={isPreviewMode}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    screenSize={screenSize}
                />
            )}

            {/* Mobile Menu Dialog */}
            <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>游戏菜单</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {!isPreviewMode && (
                            <Button
                                onClick={() => handlePauseMenuAction('save')}
                                variant="outline"
                                className="w-full"
                            >
                                <Save className="size-4 mr-2" />
                                保存当前进度
                            </Button>
                        )}
                        {isPreviewMode ? (
                            <Button
                                onClick={() => {
                                    localStorage.removeItem('tempPreviewLevel');
                                    onNavigate('puzzleEditor');
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                返回编辑器
                            </Button>
                        ) : (
                            <>
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
                            </>
                        )}
                        <Button
                            onClick={() => setShowMobileMenu(false)}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            继续游戏
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Load Game Dialog */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>发现保存的游戏进度</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>检测到有保存的游戏进度，您想要：</p>
                    </div>
                    <DialogFooter>
                        <div className="flex flex-col gap-2 w-full">
                            <Button
                                onClick={() => handleLoadChoice(true)}
                                className="w-full"
                            >
                                继续上次进度
                            </Button>
                            <Button
                                onClick={() => handleLoadChoice(false)}
                                variant="outline"
                                className="w-full"
                            >
                                重新开始
                            </Button>
                        </div>
                    </DialogFooter>
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
                            <p>难度: {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : difficulty === 'hard' ? '困难' : '自定义'}</p>
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
                                    下一关 (第 {typeof level === 'number' ? level + 1 : level} 关)
                                </Button>
                            )}
                            {isPreviewMode ? (
                                <Button
                                    onClick={() => {
                                        localStorage.removeItem('tempPreviewLevel');
                                        onNavigate('puzzleEditor');
                                    }}
                                    className="w-full"
                                >
                                    返回编辑器
                                </Button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
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
                                        排行榜
                                    </Button>
                                    <Button
                                        onClick={() => onNavigate('home')}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        主页
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
