import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Play, Trophy, Settings, Edit3, Gamepad2 } from 'lucide-react';
import { Page } from '../App';

interface HomepageProps {
  onNavigate: (page: Page) => void;
}

export function Homepage({ onNavigate }: HomepageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Main Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Gamepad2 className="size-16 text-primary-foreground mr-4" />
            <h1 className="text-6xl" style={{ color: 'hsl(var(--text-primary))' }}>拼图工作室</h1>
          </div>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'hsl(var(--text-secondary))' }}>
            欢迎来到终极游戏体验。创建、游玩并在富有挑战性的拼图游戏中竞争。
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group" style={{ backgroundColor: 'hsl(var(--card-bg) / 0.9)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                <Play className="size-8 text-primary-foreground" />
              </div>
              <CardTitle style={{ color: 'hsl(var(--text-primary))' }}>开始游戏</CardTitle>
              <CardDescription style={{ color: 'hsl(var(--text-muted))' }}>
                选择您喜欢的难度开始新游戏
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => onNavigate('difficulty')}
              >
                开始游玩
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group" style={{ backgroundColor: 'hsl(var(--card-bg) / 0.9)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="size-8 text-primary-foreground" />
              </div>
              <CardTitle style={{ color: 'hsl(var(--text-primary))' }}>排行榜</CardTitle>
              <CardDescription style={{ color: 'hsl(var(--text-muted))' }}>
                查看最高分数并与其他玩家竞争
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onNavigate('leaderboard')}
              >
                查看分数
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group" style={{ backgroundColor: 'hsl(var(--card-bg) / 0.9)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                <Edit3 className="size-8 text-primary-foreground" />
              </div>
              <CardTitle style={{ color: 'hsl(var(--text-primary))' }}>关卡编辑器</CardTitle>
              <CardDescription style={{ color: 'hsl(var(--text-muted))' }}>
                创建和自定义您自己的关卡
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onNavigate('editorDifficulty')}
              >
                打开编辑器
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group" style={{ backgroundColor: 'hsl(var(--card-bg) / 0.9)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                <Settings className="size-8 text-primary-foreground" />
              </div>
              <CardTitle style={{ color: 'hsl(var(--text-primary))' }}>主题设置</CardTitle>
              <CardDescription style={{ color: 'hsl(var(--text-muted))' }}>
                配置游戏主题、音乐和音效
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onNavigate('settings')}
              >
                主题设置
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Stats */}
        <div className="mt-12 text-center">
                  {/* 登录按钮 */}
                  <Button
                      variant="outline"
                      className="absolute top-4 right-4"
                      onClick={() => onNavigate('login')}
                  >
                      🔐 登录 / 注册
                  </Button>
        </div>
      </div>
    </div>
  );
}