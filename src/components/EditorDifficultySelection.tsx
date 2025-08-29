import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Zap, Target, Flame, Grid, Edit3 } from 'lucide-react';
import { Page } from '../App';

interface EditorDifficultySelectionProps {
  onNavigate: (page: Page) => void;
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
}

const difficulties = [
  {
    id: 'easy' as const,
    title: '简单编辑器',
    subtitle: '3x3拼图创建器',
    description: '创建简单的3x3拼图游戏，适合初学者和快速游戏会话。',
    icon: Zap,
    color: 'bg-green-500',
    gridSize: '3x3',
    pieces: 9,
    features: ['简单网格布局', '简单的拼图管理', '快速设计过程']
  },
  {
    id: 'medium' as const,
    title: '中等编辑器', 
    subtitle: '4x4拼图创建器',
    description: '设计平衡的4x4拼图游戏，具有中等复杂性和引人入胜的玩法。',
    icon: Target,
    color: 'bg-yellow-500',
    gridSize: '4x4',
    pieces: 16,
    features: ['平衡复杂性', '标准拼图尺寸', '适合大多数玩家']
  },
  {
    id: 'hard' as const,
    title: '困难编辑器',
    subtitle: '5x5拼图创建器',
    description: '制作具有挑战性的5x5拼图游戏，适合寻求最大难度的专业玩家。',
    icon: Flame,
    color: 'bg-red-500',
    gridSize: '5x5',
    pieces: 25,
    features: ['最大复杂性', '专家级设计', '高级拼图创建']
  }
];

export function EditorDifficultySelection({ onNavigate, onSelectDifficulty, selectedDifficulty }: EditorDifficultySelectionProps) {
  const handleEnterEditor = () => {
    onSelectDifficulty(selectedDifficulty);
    onNavigate('editor');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => onNavigate('home')}
            className="bg-card/80 backdrop-blur-sm"
          >
            <ArrowLeft className="size-4 mr-2" />
            返回主页
          </Button>
          <h1 className="text-4xl text-primary-foreground flex items-center">
            <Edit3 className="size-10 mr-4" />
            选择编辑器类型
          </h1>
          <div></div>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-12">
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            选择您要创建的拼图复杂性。每个难度提供不同的网格大小和设计挑战。
          </p>
        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {difficulties.map((difficulty) => {
            const IconComponent = difficulty.icon;
            const isSelected = selectedDifficulty === difficulty.id;
            
            return (
              <Card 
                key={difficulty.id}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-primary scale-105 bg-card' 
                    : 'bg-card/90 backdrop-blur-sm hover:bg-card/95 hover:scale-102'
                }`}
                onClick={() => onSelectDifficulty(difficulty.id)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto ${difficulty.color} rounded-full p-4 mb-4`}>
                    <IconComponent className="size-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{difficulty.title}</CardTitle>
                  <CardDescription className="text-lg">{difficulty.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    {difficulty.description}
                  </p>
                  
                  {/* Grid Preview */}
                  <div className="flex justify-center">
                    <div className={`grid gap-1 p-4 bg-muted rounded-lg ${
                      difficulty.id === 'easy' ? 'grid-cols-3' :
                      difficulty.id === 'medium' ? 'grid-cols-4' : 'grid-cols-5'
                    }`}>
                      {Array.from({ length: difficulty.pieces }).map((_, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 bg-primary rounded-sm"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        <Grid className="size-4 mr-2" />
                        网格大小：
                      </span>
                      <span>{difficulty.gridSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总拼图块：</span>
                      <span>{difficulty.pieces}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-medium">特性：</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {difficulty.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="size-1.5 bg-current rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isSelected && (
                    <div className="text-center pt-2">
                      <div className="text-sm text-primary font-medium">
                        ✓ 已选择
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleEnterEditor}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            进入编辑器 ({difficulties.find(d => d.id === selectedDifficulty)?.title.replace('编辑器', '')})
          </Button>
          <Button 
            variant="outline"
            onClick={() => onNavigate('home')}
            className="bg-card/80 backdrop-blur-sm text-lg px-8 py-3"
          >
            取消
          </Button>
        </div>

        {/* Info */}
        <div className="mt-12 text-center text-primary-foreground/70">
          <p>您可以随时在不同编辑器模式之间切换。</p>
          <p className="mt-2">创建自定义拼图并与其他玩家分享！</p>
        </div>
      </div>
    </div>
  );
}