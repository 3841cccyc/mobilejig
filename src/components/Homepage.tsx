import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Play, Trophy, Settings, Edit3, Gamepad2, User, LogOut } from 'lucide-react';
import { Page } from '../App';
import { getCurrentUser, logout } from './regis'; // 导入获取当前用户和退出登录的函数

interface HomepageProps {
    onNavigate: (page: Page) => void;
}

export function Homepage({ onNavigate }: HomepageProps) {
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    // 检查登录状态的通用函数
    const checkLoginAndNavigate = (page: Page) => {
        if (!currentUser && page !== 'login') {
            alert('请先登录后再进行操作');
            onNavigate('login');
        } else {
            onNavigate(page);
        }
    };

    // 处理退出登录
    const handleLogout = () => {
        logout(); // 调用退出登录函数
        setCurrentUser(null); // 清除本地状态
        alert('已成功退出登录');
    };

    // 监听用户状态变化
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                {/* 用户信息栏 - 固定在右上角 */}
                {currentUser && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                        <User className="size-4 text-primary-foreground" />
                        <span className="text-sm text-primary-foreground">{currentUser.username}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title="退出登录"
                        >
                            <LogOut className="size-4" />
                        </Button>
                    </div>
                )}

                {/* Main Title */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <Gamepad2 className="size-16 text-primary-foreground mr-4" />
                        <h1 className="text-6xl text-primary-foreground">拼图工作室</h1>
                    </div>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                        欢迎来到终极游戏体验。创建、游玩并在富有挑战性的拼图游戏中竞争。
                    </p>

                    {/* 用户欢迎信息 */}
                    {currentUser && (
                        <div className="mt-6 p-4 bg-card/50 backdrop-blur-sm rounded-lg inline-block">
                            <div className="flex items-center justify-center text-primary-foreground">
                                <User className="size-6 mr-2" />
                                <span>欢迎回来, {currentUser.username}!</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                                <Play className="size-8 text-primary-foreground" />
                            </div>
                            <CardTitle>开始游戏</CardTitle>
                            <CardDescription>
                                选择您喜欢的难度开始新游戏
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                onClick={() => checkLoginAndNavigate('difficulty')}
                            >
                                开始游玩
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                                <Trophy className="size-8 text-primary-foreground" />
                            </div>
                            <CardTitle>排行榜</CardTitle>
                            <CardDescription>
                                查看最高分数并与其他玩家竞争
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => checkLoginAndNavigate('leaderboard')}
                            >
                                查看分数
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-300 cursor-pointer group">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                                <Edit3 className="size-8 text-primary-foreground" />
                            </div>
                            <CardTitle>关卡编辑器</CardTitle>
                            <CardDescription>
                                创建和自定义您自己的关卡
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => checkLoginAndNavigate('puzzleEditor')}
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

                {/* Game Stats and Login Button */}
                <div className="mt-12 text-center">
                    <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        <div className="text-primary-foreground">
                            <h3 className="text-2xl">1,247</h3>
                            <p className="text-primary-foreground/70">玩家</p>
                        </div>
                        <div className="text-primary-foreground">
                            <h3 className="text-2xl">856</h3>
                            <p className="text-primary-foreground/70">关卡</p>
                        </div>
                        <div className="text-primary-foreground">
                            <h3 className="text-2xl">4.8★</h3>
                            <p className="text-primary-foreground/70">评分</p>
                        </div>
                    </div>

                    {/* 登录/注册按钮 */}
                    <div className="mt-8">
                        {!currentUser && (
                            <Button
                                variant="outline"
                                onClick={() => onNavigate('login')}
                                className="flex items-center gap-2 mx-auto"
                            >
                                <User className="size-4" />
                                登录 / 注册
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}