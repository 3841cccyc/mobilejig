import { useState, useEffect } from 'react';
import { HomePage } from './HomePage';
import { DifficultySelection } from './DifficultySelection';
import { GamePage } from './GamePage';
import { MobileGamePage } from './MobileGamePage';
import { LevelSelection } from './LevelSelection';
import { PuzzleEditor } from './PuzzleEditor';
import { Leaderboard } from './Leaderboard';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { SettingsPage } from './SettingsPage';
import { MobileViewport } from './MobileViewport';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';

export type Page = 'home' | 'login' | 'register' | 'difficulty' | 'game' | 'levelSelection' | 'puzzleEditor' | 'leaderboard' | 'settings' | 'customLevels';

export function App() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'custom'>('easy');
    const [selectedLevel, setSelectedLevel] = useState<number | string>(1);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    
    const { isMobile, isTablet } = useMobileDetection();
    const { shouldReduceAnimations, cleanup } = usePerformanceOptimization({
        enableVirtualization: true,
        enableLazyLoading: true,
        enableImageOptimization: true,
        enableReducedMotion: true
    });

    // 清理性能优化资源
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    const handleNavigate = (page: Page) => {
        if (page === 'game') {
            const tempPreviewLevel = localStorage.getItem('tempPreviewLevel');
            if (tempPreviewLevel) {
                const previewData = JSON.parse(tempPreviewLevel);
                setIsPreviewMode(true);
                setSelectedDifficulty('custom');
                setSelectedLevel(previewData.id);
            } else {
                setIsPreviewMode(false);
            }
        } else {
            setIsPreviewMode(false);
        }
        setCurrentPage(page);
    };

    const handleNextLevel = () => {
        if (typeof selectedLevel === 'number') {
            setSelectedLevel(selectedLevel + 1);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage onNavigate={handleNavigate} />;
            case 'login':
                return <LoginPage onNavigate={handleNavigate} />;
            case 'register':
                return <RegisterPage onNavigate={handleNavigate} />;
            case 'difficulty':
                return <DifficultySelection onNavigate={handleNavigate} />;
            case 'levelSelection':
                return <LevelSelection
                    onNavigate={handleNavigate}
                    onSelectLevel={setSelectedLevel}
                    difficulty={selectedDifficulty}
                />;
            case 'customLevels':
                return <LevelSelection
                    onNavigate={handleNavigate}
                    onSelectLevel={setSelectedLevel}
                    difficulty="custom"
                />;
            case 'puzzleEditor':
                return <PuzzleEditor onNavigate={handleNavigate} />;
            case 'leaderboard':
                return <Leaderboard onNavigate={handleNavigate} />;
            case 'settings':
                return <SettingsPage onNavigate={handleNavigate} />;
            case 'game':
                // 根据设备类型选择不同的游戏页面
                if (isMobile) {
                    return (
                        <MobileViewport
                            enableZoom={true}
                            enablePan={true}
                            minZoom={0.5}
                            maxZoom={2.0}
                            initialZoom={1.0}
                            className="h-screen"
                        >
                            <MobileGamePage
                                onNavigate={handleNavigate}
                                difficulty={selectedDifficulty}
                                level={selectedLevel}
                                onNextLevel={handleNextLevel}
                                isPreviewMode={isPreviewMode}
                            />
                        </MobileViewport>
                    );
                } else {
                    return (
                        <GamePage
                            onNavigate={handleNavigate}
                            difficulty={selectedDifficulty}
                            level={selectedLevel}
                            onNextLevel={handleNextLevel}
                            isPreviewMode={isPreviewMode}
                        />
                    );
                }
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className={`min-h-screen bg-background text-foreground ${shouldReduceAnimations ? 'motion-reduce' : ''}`}>
            {renderPage()}
        </div>
    );
}
