import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, PlayCircle, Lock } from 'lucide-react';
import { Page } from '../App';
import { levels } from './levels';

interface LevelSelectionProps {
  onNavigate: (page: Page) => void;
  onSelectLevel: (level: number) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function LevelSelection({ onNavigate, onSelectLevel, difficulty }: LevelSelectionProps) {
  const difficultyLevels = levels[difficulty];

  const handleLevelSelect = (levelId: number) => {
    onSelectLevel(levelId);
    onNavigate('game');
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
                </div>
                <CardHeader>
                  <CardTitle>第 {level.id} 关</CardTitle>
                  <CardDescription>{level.name}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
