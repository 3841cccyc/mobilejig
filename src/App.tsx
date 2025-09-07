import React, { useState } from 'react';
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

  const handleNextLevel = () => {
    setSelectedLevel(prev => typeof prev === 'number' ? prev + 1 : prev);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
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
          onNavigate={setCurrentPage}
          onSelectLevel={setSelectedLevel}
          difficulty={selectedDifficulty}
        />;
      case 'puzzleEditor':
        return <PuzzleEditor onNavigate={setCurrentPage} />;
      case 'game':
            return <GamePage onNavigate={setCurrentPage} difficulty={selectedDifficulty} level={selectedLevel} onNextLevel={handleNextLevel} />;
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