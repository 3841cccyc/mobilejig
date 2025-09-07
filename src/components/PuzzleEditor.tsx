import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { ArrowLeft, Upload, Play, Settings, Grid3X3 } from 'lucide-react';
import { Page } from '../App';


interface PuzzleEditorProps {
  onNavigate: (page: Page) => void;
}

export function PuzzleEditor({ onNavigate }: PuzzleEditorProps) {
  const [currentStep, setCurrentStep] = useState<'config' | 'image' | 'preview'>('config');
  const [levelConfig, setLevelConfig] = useState({
    name: '',
    rows: 3,
    cols: 3,
    pieceShape: 'regular' as 'regular' | 'irregular'
  });
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 组件初始化时清除任何临时预览数据
  useEffect(() => {
    localStorage.removeItem('tempPreviewLevel');
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
          setImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('请选择有效的图片文件');
      }
    }
  }, []);

  // 处理URL输入
  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setPreviewImage(url);
    }
  };


  // 预览关卡
  const handlePreviewLevel = () => {
    if (!levelConfig.name.trim() || !imageUrl) {
      alert('请完成关卡配置和图片设置');
      return;
    }
    
    // 创建临时关卡数据进行预览
    const tempLevel = {
      id: `preview_${Date.now()}`,
      name: levelConfig.name,
      imageUrl: imageUrl,
      rows: levelConfig.rows,
      cols: levelConfig.cols,
      pieceShape: levelConfig.pieceShape,
      createdAt: new Date()
    };

    // 保存临时关卡到localStorage用于预览
    localStorage.setItem('tempPreviewLevel', JSON.stringify(tempLevel));
    
    // 跳转到游戏页面进行预览
    onNavigate('game');
  };


  const renderConfigStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="levelName">关卡名称</Label>
        <Input
          id="levelName"
          value={levelConfig.name}
          onChange={(e) => setLevelConfig(prev => ({ ...prev, name: e.target.value }))}
          placeholder="输入关卡名称"
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rows">行数</Label>
          <Select
            value={levelConfig.rows.toString()}
            onValueChange={(value: string) => setLevelConfig(prev => ({ ...prev, rows: parseInt(value) }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 7, 8].map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cols">列数</Label>
          <Select
            value={levelConfig.cols.toString()}
            onValueChange={(value: string) => setLevelConfig(prev => ({ ...prev, cols: parseInt(value) }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 7, 8].map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
                    </div>
              </div>

      <div>
        <Label>拼图块形状</Label>
        <div className="flex items-center space-x-6 mt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="regular"
              checked={levelConfig.pieceShape === 'regular'}
              onCheckedChange={(checked: boolean) => 
                setLevelConfig(prev => ({ ...prev, pieceShape: checked ? 'regular' : 'irregular' }))
              }
            />
            <Label htmlFor="regular">规则形状</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="irregular"
              checked={levelConfig.pieceShape === 'irregular'}
              onCheckedChange={(checked: boolean) => 
                setLevelConfig(prev => ({ ...prev, pieceShape: checked ? 'irregular' : 'regular' }))
              }
            />
            <Label htmlFor="irregular">不规则形状</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => onNavigate('home')}>
          <ArrowLeft className="size-4 mr-2" />
          返回
                </Button>
        <Button onClick={() => setCurrentStep('image')}>
          下一步
                  </Button>
              </div>
              </div>
  );

  const renderImageStep = () => (
    <div className="space-y-6">
      <div>
        <Label>上传图片</Label>
        <div className="mt-2 space-y-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              <Upload className="size-4 mr-2" />
              选择文件
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <span className="text-sm text-muted-foreground">
              支持 JPG, PNG, GIF 格式
            </span>
          </div>

          <div className="text-center text-muted-foreground">或</div>

          <div>
            <Label htmlFor="imageUrl">输入图片URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {previewImage && (
        <div>
          <Label>图片预览</Label>
          <div className="mt-2 border rounded-lg p-4">
            <img
              src={previewImage}
              alt="预览"
              className="max-w-full max-h-64 mx-auto rounded"
              onError={() => {
                alert('图片加载失败，请检查URL是否正确');
                setPreviewImage('');
                setImageUrl('');
              }}
                    />
                  </div>
              </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('config')}>
          上一步
        </Button>
        <Button 
          onClick={() => setCurrentStep('preview')}
          disabled={!imageUrl}
        >
          下一步
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <Label>关卡预览</Label>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-lg">{levelConfig.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">网格大小:</span>
                <span className="ml-2">{levelConfig.rows} × {levelConfig.cols}</span>
              </div>
              <div>
                <span className="font-medium">拼图块数:</span>
                <span className="ml-2">{levelConfig.rows * levelConfig.cols}</span>
              </div>
              <div>
                <span className="font-medium">拼图块形状:</span>
                <span className="ml-2">{levelConfig.pieceShape === 'regular' ? '规则' : '不规则'}</span>
                </div>
              <div>
                <span className="font-medium">难度:</span>
                <span className="ml-2">
                  {levelConfig.rows * levelConfig.cols <= 9 ? '简单' : 
                   levelConfig.rows * levelConfig.cols <= 16 ? '中等' : '困难'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {previewImage && (
        <div>
          <Label>图片预览</Label>
          <div className="mt-2 border rounded-lg p-4">
            <img
              src={previewImage}
              alt="预览"
              className="max-w-full max-h-64 mx-auto rounded"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('image')}>
          上一步
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handlePreviewLevel}>
            <Play className="size-4 mr-2" />
            预览关卡
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => onNavigate('home')}
            className="bg-card/80 backdrop-blur-sm"
          >
            <ArrowLeft className="size-4 mr-2" />
            返回首页
          </Button>
          <h1 className="text-4xl text-primary-foreground flex items-center">
            <Settings className="size-8 mr-3" />
            拼图编辑器
          </h1>
          <div></div>
            </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Grid3X3 className="size-5 mr-2" />
              步骤 {currentStep === 'config' ? '1' : currentStep === 'image' ? '2' : '3'}: {
                currentStep === 'config' ? '配置关卡' : 
                currentStep === 'image' ? '设置图片' : '预览保存'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 'config' && renderConfigStep()}
            {currentStep === 'image' && renderImageStep()}
            {currentStep === 'preview' && renderPreviewStep()}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
