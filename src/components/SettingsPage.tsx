import React from 'react';
import { useSettings, themes } from '../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Music, Palette, Volume2 } from 'lucide-react';
import { Page } from '../App';

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
}

// 一个简单的开关UI组件
const ToggleSwitch = ({ label, checked, onChange, icon: Icon }: { label: string, checked: boolean, onChange: () => void, icon: React.ElementType }) => (
  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted-bg) / 0.5)' }}>
    <div className="flex items-center">
      <Icon className="size-5 mr-3 text-primary" />
      <span className="text-foreground font-medium">{label}</span>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-primary' : 'bg-gray-400'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { isMusicOn, toggleMusic, isSfxOn, toggleSfx, theme, setTheme, selectedMusic, setMusic, playSfx } = useSettings();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm" style={{ backgroundColor: 'hsl(var(--card-bg) / 0.9)' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('home')}
                className="mr-2"
            >
                <ArrowLeft className="size-5" />
            </Button>
            <CardTitle className="text-2xl flex-grow text-center">主题设置</CardTitle>
            <div className="w-9"></div> {/* 占位符，为了让标题居中 */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <ToggleSwitch label="背景音乐" checked={isMusicOn} onChange={toggleMusic} icon={Music} />
            
            {/* 音乐类型选择 */}
            {isMusicOn && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">音乐类型</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'classical', label: '欢快', emoji: '🎼' },
                    { key: 'ambient', label: '惬意', emoji: '🌊' },
                    { key: 'electronic', label: '刺激', emoji: '🎵' }
                  ].map(({ key, label, emoji }) => (
                    <Button
                      key={key}
                      variant={selectedMusic === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMusic(key as any)}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <ToggleSwitch label="游戏音效" checked={isSfxOn} onChange={toggleSfx} icon={Volume2} />
            
            {/* 音效测试按钮 */}
            {isSfxOn && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playSfx('dragStart')}
                  className="flex-1"
                >
                  测试拖动音效
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playSfx('dragEnd')}
                  className="flex-1"
                >
                  测试放置音效
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-foreground font-medium flex items-center"><Palette className="size-5 mr-3 text-primary"/>主题颜色</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.keys(themes).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setTheme(themeName as keyof typeof themes)}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    theme === themeName ? 'border-primary scale-105' : 'border-transparent'
                  }`}
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themes[themeName as keyof typeof themes]['--gradient-from']}), hsl(${themes[themeName as keyof typeof themes]['--gradient-to']}))`
                  }}
                  title={themeName}
                />
              ))}
            </div>
          </div>

          {/* 当前设置状态 */}
          <div className="space-y-3">
            <h3 className="text-foreground font-medium">当前设置状态</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'hsl(var(--muted-bg) / 0.3)' }}>
                <span>背景音乐:</span>
                <span className={`px-2 py-1 rounded text-xs ${isMusicOn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {isMusicOn ? `已开启 (${selectedMusic === 'classical' ? '欢快' : selectedMusic === 'ambient' ? '惬意' : '刺激'})` : '已关闭'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'hsl(var(--muted-bg) / 0.3)' }}>
                <span>游戏音效:</span>
                <span className={`px-2 py-1 rounded text-xs ${isSfxOn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {isSfxOn ? '已开启' : '已关闭'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'hsl(var(--muted-bg) / 0.3)' }}>
                <span>主题颜色:</span>
                <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                  {theme === 'blue' ? '蓝色' : theme === 'green' ? '绿色' : theme === 'purple' ? '紫色' : '橙色'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}