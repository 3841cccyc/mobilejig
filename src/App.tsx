import { useState, useEffect } from 'react';
import { Homepage } from './components/Homepage';
import { Leaderboard } from './components/Leaderboard';
import { DifficultySelection } from './components/DifficultySelection';
import { GamePage } from './components/GamePage';
import { AuthForm } from './components/AuthForm';
import { SettingsPage } from './components/SettingsPage'; // 引入新页面
import { SettingsProvider } from './context/SettingsContext'; // 引入 Provider
import { LevelSelection } from './components/LevelSelection';
import { PuzzleEditor } from './components/PuzzleEditor';


// 扩展 Page 类型
export type Page = 'home' | 'difficulty' | 'levelSelection' | 'leaderboard' | 'login' | 'game' | 'settings' | 'puzzleEditor';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'custom'>('easy');
  const [selectedLevel, setSelectedLevel] = useState<number | string>(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [pendingLevelId, setPendingLevelId] = useState<string | null>(null);

  const handleNextLevel = () => {
    setSelectedLevel(prev => typeof prev === 'number' ? prev + 1 : prev);
  };

  // 处理待跳转的关卡
  useEffect(() => {
    if (pendingLevelId && currentPage === 'game') {
      setSelectedLevel(pendingLevelId);
      setPendingLevelId(null);
    }
  }, [pendingLevelId, currentPage]);

  const handleNavigate = (page: Page) => {
    // 检查是否是预览模式
    if (page === 'game') {
      const tempPreviewLevel = localStorage.getItem('tempPreviewLevel');
      if (tempPreviewLevel) {
        const previewData = JSON.parse(tempPreviewLevel);
        
        // 同步设置所有预览相关的状态
        setIsPreviewMode(true);
        setSelectedDifficulty('custom');
        setSelectedLevel(previewData.id);
        setPendingLevelId(null); // 清除pending状态，直接设置selectedLevel
      } else {
        // 如果没有临时预览数据，重置为正常模式
        setIsPreviewMode(false);
        // 保持当前的难度和关卡设置
      }
    } else {
      setIsPreviewMode(false);
    }
    setCurrentPage(page);
  };


  // 通用的游玩关卡函数
  const handlePlayLevel = (levelId: number | string) => {
    setIsPreviewMode(false);
    setSelectedDifficulty('custom'); // 确保设置为自定义难度
    setSelectedLevel(levelId.toString()); // 直接设置selectedLevel，避免异步问题
    setCurrentPage('game');
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Homepage onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <Leaderboard onNavigate={handleNavigate} />;
      case 'difficulty':
        return <DifficultySelection 
          onNavigate={setCurrentPage} 
          onSelectDifficulty={setSelectedDifficulty}
          selectedDifficulty={selectedDifficulty}
        />;
      case 'levelSelection':
        return <LevelSelection
          onNavigate={handleNavigate}
          onSelectLevel={setSelectedLevel}
          onPlayLevel={handlePlayLevel}
          difficulty={selectedDifficulty}
        />;
      case 'puzzleEditor':
        return <PuzzleEditor onNavigate={handleNavigate} />;
      case 'game':
            return <GamePage onNavigate={setCurrentPage} difficulty={selectedDifficulty} level={selectedLevel} onNextLevel={handleNextLevel} isPreviewMode={isPreviewMode} />;
      case 'login':
            return <AuthForm onNavigate={setCurrentPage} />;
      case 'settings': // 添加新页面的路由
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <Homepage onNavigate={handleNavigate} />;
    }
  };

  return (
    <SettingsProvider> {/* 用 Provider 包裹整个应用 */}
      <div className="min-h-screen" style={{
        background: `linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to)))`
      }}>
        {renderPage()}
      </div>
    </SettingsProvider>
  );
}