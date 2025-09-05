import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Page } from '../App';
import { PuzzleGame } from './PuzzleGame';
import { unsplash_tool } from '../tools/unsplash';

interface GamePageProps {
  onNavigate: (page: Page) => void;
  difficulty: 'easy' | 'medium' | 'hard';
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

export function GamePage({ onNavigate, difficulty }: GamePageProps) {
  const [timeLeft, setTimeLeft] = useState(difficultySettings[difficulty].timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'completed' | 'gameOver'>('playing');
  const [moves, setMoves] = useState(0);
  const [puzzleImageUrl, setPuzzleImageUrl] = useState<string>('');

  const settings = difficultySettings[difficulty];
  const config = difficultyConfig[difficulty];

  // Load puzzle image on mount
  useEffect(() => {
    const loadPuzzleImage = async () => {
      try {
        // Generate a random puzzle theme
        const themes = [
          'beautiful landscape',
          'colorful flowers',
          'mountain scenery',
          'ocean waves',
          'forest nature',
          'sunset horizon',
          'peaceful garden',
          'wildlife animals'
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        // Use a placeholder for now - in real implementation, you would use unsplash_tool
        const imageUrl = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop&crop=center`;
        setPuzzleImageUrl(imageUrl);
      } catch (error) {
        console.error('Failed to load puzzle image:', error);
        // Use a solid color fallback
        setPuzzleImageUrl('');
      }
    };

    loadPuzzleImage();
  }, []);

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
    setGameState('completed');
  };

  const handleNavigate = (page: 'home' | 'difficulty' | 'editorDifficulty') => {
    if (page === 'home') {
      onNavigate('home');
    } else if (page === 'difficulty') {
      onNavigate('difficulty');
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

    if (gameState === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl">🎉 恭喜通关！</h1>
                    <p className="text-muted-foreground">
                        你完成了拼图！
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => window.location.reload()}>
                            再玩一次
                        </Button>
                        <Button onClick={() => onNavigate('difficulty')} variant="outline">
                            更改难度
                        </Button>
                        <Button onClick={() => onNavigate('home')} variant="ghost">
                            返回主页
                        </Button>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <div>步数：{moves}</div>
                        {settings.timeLimit && (
                            <div>用时：{formatTime(settings.timeLimit - (timeLeft ?? 0))}</div>
                        )}
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
    </div>
  );
}