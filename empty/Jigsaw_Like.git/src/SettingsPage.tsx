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
  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
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
  const { isMusicOn, toggleMusic, isSfxOn, toggleSfx, theme, setTheme } = useSettings();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm">
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
            <ToggleSwitch label="游戏音效" checked={isSfxOn} onChange={toggleSfx} icon={Volume2} />
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
                  style={{ backgroundColor: `hsl(${themes[themeName as keyof typeof themes]['--primary']})` }}
                  title={themeName}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}