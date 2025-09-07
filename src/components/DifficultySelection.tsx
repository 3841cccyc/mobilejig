import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Zap, Target, Flame, Star, Clock, Brain, Settings } from 'lucide-react';
import { Page } from '../App';

interface DifficultySelectionProps {
  onNavigate: (page: Page) => void;
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'custom') => void;
  selectedDifficulty: 'easy' | 'medium' | 'hard' | 'custom';
}

const difficulties = [
  {
    id: 'easy' as const,
    title: '简单',
    subtitle: '适合初学者',
    description: '简单的3x3拼图网格，轻松的游戏体验和有用的提示。',
    icon: Zap,
    color: 'bg-green-500',
    features: ['3x3拼图网格', '有用的提示', '简单图案', '宽容的评分'],
    timeLimit: '无时间限制',
    pointMultiplier: '1倍',
    gridSize: '3x3块'
  },
  {
    id: 'medium' as const,
    title: '中等', 
    subtitle: '平衡的挑战',
    description: '标准的4x4拼图网格，中等难度。挑战和乐趣的完美平衡。',
    icon: Target,
    color: 'bg-yellow-500',
    features: ['4x4拼图网格', '部分提示可用', '复杂图案', '平衡评分'],
    timeLimit: '每个拼图5分钟',
    pointMultiplier: '1.5倍',
    gridSize: '4x4块'
  },
  {
    id: 'hard' as const,
    title: '困难',
    subtitle: '仅限专家',
    description: '具有挑战性的5x5拼图网格，时间限制紧迫。仅适合最熟练的玩家。',
    icon: Flame,
    color: 'bg-red-500',
    features: ['5x5拼图网格', '无提示', '非常复杂的图案', '高分潜力'],
    timeLimit: '每个拼图3分钟',
    pointMultiplier: '2倍',
    gridSize: '5x5块'
  },
  {
    id: 'custom' as const,
    title: '自定义关卡',
    subtitle: '您创建的关卡',
    description: '游玩您使用关卡编辑器创建的自定义拼图关卡。',
    icon: Settings,
    color: 'bg-purple-500',
    features: ['自定义网格大小', '自定义拼图块形状', '个人图片', '独特体验'],
    timeLimit: '无限制',
    pointMultiplier: '1.5倍',
    gridSize: '自定义'
  }
];

export function DifficultySelection({ onNavigate, onSelectDifficulty, selectedDifficulty }: DifficultySelectionProps) {
  const handleSelectLevel = () => {
    if (selectedDifficulty === 'custom') {
      // 检查是否有自定义关卡
      const customLevels = localStorage.getItem('customLevels');
      console.log('检查自定义关卡:', customLevels); // 调试信息
      
      if (!customLevels) {
        alert('您还没有创建任何自定义关卡，请先使用关卡编辑器创建关卡！');
        onNavigate('puzzleEditor');
        return;
      }
      
      try {
        const parsedLevels = JSON.parse(customLevels);
        console.log('解析后的关卡数据:', parsedLevels); // 调试信息
        
        if (!Array.isArray(parsedLevels) || parsedLevels.length === 0) {
          alert('您还没有创建任何自定义关卡，请先使用关卡编辑器创建关卡！');
          onNavigate('puzzleEditor');
          return;
        }
        
        // 额外检查：确保关卡数据有效
        const validLevels = parsedLevels.filter(level => 
          level && 
          level.id && 
          level.name && 
          level.rows && 
          level.cols
        );
        
        if (validLevels.length === 0) {
          alert('自定义关卡数据无效，请重新创建关卡！');
          onNavigate('puzzleEditor');
          return;
        }
        
        console.log('有效关卡数量:', validLevels.length);
        
      } catch (error) {
        console.error('解析自定义关卡数据失败:', error);
        alert('自定义关卡数据格式错误，请重新创建关卡！');
        onNavigate('puzzleEditor');
        return;
      }
      
      onSelectDifficulty(selectedDifficulty);
      onNavigate('levelSelection');
    } else {
      onSelectDifficulty(selectedDifficulty);
      onNavigate('levelSelection');
    }
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
            <Brain className="size-10 mr-4" />
            选择难度
          </h1>
          <div></div>
        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
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
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        <Clock className="size-4 mr-2" />
                        时间限制：
                      </span>
                      <span>{difficulty.timeLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        <Star className="size-4 mr-2" />
                        分数倍数：
                      </span>
                      <span>{difficulty.pointMultiplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        <Target className="size-4 mr-2" />
                        网格大小：
                      </span>
                      <span>{difficulty.gridSize}</span>
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
            onClick={handleSelectLevel}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            {selectedDifficulty === 'custom' ? '进入编辑器' : `选择关卡 (${difficulties.find(d => d.id === selectedDifficulty)?.title})`}
          </Button>
          <Button 
            variant="outline"
            onClick={() => onNavigate('leaderboard')}
            className="bg-card/80 backdrop-blur-sm text-lg px-8 py-3"
          >
            查看排行榜
          </Button>
        </div>

        {/* Difficulty Info */}
        <div className="mt-12 text-center text-primary-foreground/70">
          <p>您可以在游戏中随时更改难度。</p>
          <p className="mt-2">更高的难度提供更好的分数倍数！</p>
        </div>
      </div>
    </div>
  );
}