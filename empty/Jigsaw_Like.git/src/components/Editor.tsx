import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Pause, Volume2, VolumeX, Upload, Plus, Edit, Trash2, Play } from 'lucide-react';
import { Page } from '../App';
import { PuzzleEditor } from './PuzzleEditor';

interface EditorProps {
  onNavigate: (page: Page) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyConfig = {
  easy: { gridSize: 3, color: 'bg-green-500', name: '简单 (3x3)' },
  medium: { gridSize: 4, color: 'bg-yellow-500', name: '中等 (4x4)' },
  hard: { gridSize: 5, color: 'bg-red-500', name: '困难 (5x5)' }
};

// Mock levels data
const mockLevels = [
  { id: 1, name: '夕阳海滩', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop', completed: true },
  { id: 2, name: '山景', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', completed: false },
  { id: 3, name: '城市天际线', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop', completed: true },
  { id: 4, name: '森林小径', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop', completed: false },
  { id: 5, name: '海浪', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop', completed: true },
  { id: 6, name: '自定义关卡', image: 'https://images.unsplash.com/photo-1506744038136-46d9c3aacc4d?w=400&h=400&fit=crop', completed: false },
];

export function Editor({ onNavigate, difficulty }: EditorProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [levels, setLevels] = useState(mockLevels);
  const [currentView, setCurrentView] = useState<'levels' | 'editor'>('levels');
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  const config = difficultyConfig[difficulty];

  const handlePauseMenuAction = (action: 'save' | 'exit') => {
    if (action === 'save') {
      // Save and exit logic
      alert('保存成功！');
      onNavigate('home');
    } else {
      // Exit without saving
      onNavigate('editorDifficulty');
    }
    setIsPaused(false);
  };

  const handleImportImage = () => {
    // Image import logic
    const imageUrl = prompt('请输入图片URL:');
    if (imageUrl) {
      const newLevel = {
        id: levels.length + 1,
        name: `导入关卡 ${levels.length + 1}`,
        image: imageUrl,
        completed: false
      };
      setLevels([...levels, newLevel]);
    }
  };

  const handleNewLevel = () => {
    const newLevel = {
      id: levels.length + 1,
      name: `新关卡 ${levels.length + 1}`,
      image: '',
      completed: false
    };
    setLevels([...levels, newLevel]);
    
    // Switch to editor view
    setEditingLevel(newLevel.id);
    setCurrentView('editor');
  };

  const handleEditLevel = (levelId: number) => {
    setEditingLevel(levelId);
    setCurrentView('editor');
  };

  const handleDeleteLevel = (levelId: number) => {
    setLevels(levels.filter(level => level.id !== levelId));
  };

  const handleTestLevel = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      alert(`测试关卡 "${level.name}" - 游戏将使用此关卡开始`);
      // In a real implementation, this would launch the game with this level
    }
  };

  const handleSavePuzzle = (puzzleData: any) => {
    if (editingLevel) {
      setLevels(levels.map(level => 
        level.id === editingLevel 
          ? { ...level, image: puzzleData.image, completed: false }
          : level
      ));
      alert('拼图保存成功！');
      setCurrentView('levels');
      setEditingLevel(null);
    }
  };

  const handleTestPuzzle = (puzzleData: any) => {
    alert('测试拼图 - 将启动游戏模式');
    // In a real implementation, this would launch the puzzle game
  };

  const currentLevel = editingLevel ? levels.find(l => l.id === editingLevel) : null;

  if (currentView === 'editor' && currentLevel) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Top Controls */}
        <div className="flex justify-between items-center p-4 bg-card/90 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentView('levels');
                setEditingLevel(null);
              }}
              className="bg-card/80 backdrop-blur-sm"
            >
              <ArrowLeft className="size-4 mr-2" />
              返回关卡列表
            </Button>
            <Badge className={`${config.color} text-white`}>
              {config.name}
            </Badge>
          </div>
          
          <div className="text-xl font-mono text-primary">
            编辑: {currentLevel.name}
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

        {/* Puzzle Editor */}
        <PuzzleEditor
          gridSize={config.gridSize}
          onSave={handleSavePuzzle}
          onTest={handleTestPuzzle}
          initialImage={currentLevel.image}
        />

        {/* Pause Menu Dialog */}
        <Dialog open={isPaused} onOpenChange={setIsPaused}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>编辑器菜单</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button 
                onClick={() => handlePauseMenuAction('save')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                保存并退出
              </Button>
              <Button 
                onClick={() => handlePauseMenuAction('exit')}
                variant="outline"
                className="w-full"
              >
                不保存退出
              </Button>
              <Button 
                onClick={() => setIsPaused(false)}
                variant="ghost"
                className="w-full"
              >
                取消
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Timer and Top Controls */}
      <div className="flex justify-between items-center p-4 bg-card/90 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => onNavigate('editorDifficulty')}
            className="bg-card/80 backdrop-blur-sm"
          >
            <ArrowLeft className="size-4 mr-2" />
            返回
          </Button>
          <Badge className={`${config.color} text-white`}>
            {config.name}
          </Badge>
        </div>
        
        <div className="text-2xl font-mono text-primary">
          关卡编辑器
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

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Central Level Grid */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-card/90 backdrop-blur-sm w-full max-w-4xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  {config.name} 关卡
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleImportImage} variant="outline" size="sm">
                    <Upload className="size-4 mr-2" />
                    导入图片
                  </Button>
                  <Button onClick={handleNewLevel} className="bg-primary hover:bg-primary/90">
                    <Plus className="size-4 mr-2" />
                    新建关卡
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {levels.map((level) => (
                  <Card key={level.id} className="relative group hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      {/* Level Preview */}
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {level.image ? (
                          <img 
                            src={level.image}
                            alt={level.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`grid gap-1 ${ 
                            config.gridSize === 3 ? 'grid-cols-3' :
                            config.gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5'
                          }`}>
                            {Array.from({ length: config.gridSize * config.gridSize }).map((_, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 bg-primary/20 rounded-sm border border-primary/30"
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditLevel(level.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Edit className="size-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestLevel(level.id)}
                            >
                              <Play className="size-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLevel(level.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Level Info */}
                      <div className="text-center">
                        <p className="font-medium truncate">{level.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.completed ? '已完成' : '进行中'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Level Card */}
                <Card 
                  className="border-dashed border-2 border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors cursor-pointer"
                  onClick={handleNewLevel}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square flex items-center justify-center mb-3">
                      <Plus className="size-12 text-muted-foreground/50" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground">创建新关卡</p>
                      <p className="text-xs text-muted-foreground/70">添加关卡</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Panel - Tools */}
        <div className="w-80 p-4 bg-card/90 backdrop-blur-sm border-l border-border">
          <Card>
            <CardHeader>
              <CardTitle>编辑器工具</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">快速操作</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleImportImage}>
                    <Upload className="size-4 mr-2" />
                    从URL导入图片
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleNewLevel}>
                    <Plus className="size-4 mr-2" />
                    创建新关卡
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">当前设置</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>网格大小：</span>
                    <span>{config.gridSize}x{config.gridSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>总拼图块：</span>
                    <span>{config.gridSize * config.gridSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>难度：</span>
                    <Badge className={`${config.color} text-white text-xs`}>
                      {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">拼图特性</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 异形拼图块设计</p>
                  <p>• 支持点击旋转90°</p>
                  <p>• 智能形状匹配检测</p>
                  <p>• 完成特效和计分</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">使用说明</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 点击"新建关卡"创建拼图</p>
                  <p>• 悬停在关卡上查看编辑选项</p>
                  <p>• 使用"导入图片"添加自定义图片</p>
                  <p>• 发布前测试关卡</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pause Menu Dialog */}
      <Dialog open={isPaused} onOpenChange={setIsPaused}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑器菜单</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              onClick={() => handlePauseMenuAction('save')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              保存并退出
            </Button>
            <Button 
              onClick={() => handlePauseMenuAction('exit')}
              variant="outline"
              className="w-full"
            >
              不保存退出
            </Button>
            <Button 
              onClick={() => setIsPaused(false)}
              variant="ghost"
              className="w-full"
            >
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}