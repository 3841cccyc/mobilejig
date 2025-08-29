import React, { useState } from 'react';
import { Homepage } from './components/Homepage';
import { Leaderboard } from './components/Leaderboard';
import { DifficultySelection } from './components/DifficultySelection';
import { EditorDifficultySelection } from './components/EditorDifficultySelection';
import { Editor } from './components/Editor';
import { GamePage } from './components/GamePage';

export type Page = 'home' | 'leaderboard' | 'difficulty' | 'editorDifficulty' | 'editor' | 'game';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [editorDifficulty, setEditorDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Homepage onNavigate={setCurrentPage} />;
      case 'leaderboard':
        return <Leaderboard onNavigate={setCurrentPage} />;
      case 'difficulty':
        return <DifficultySelection 
          onNavigate={setCurrentPage} 
          onSelectDifficulty={setSelectedDifficulty}
          selectedDifficulty={selectedDifficulty}
        />;
      case 'editorDifficulty':
        return <EditorDifficultySelection 
          onNavigate={setCurrentPage}
          onSelectDifficulty={setEditorDifficulty}
          selectedDifficulty={editorDifficulty}
        />;
      case 'editor':
        return <Editor onNavigate={setCurrentPage} difficulty={editorDifficulty} />;
      case 'game':
        return <GamePage onNavigate={setCurrentPage} difficulty={selectedDifficulty} />;
      default:
        return <Homepage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      {renderPage()}
    </div>
  );
}