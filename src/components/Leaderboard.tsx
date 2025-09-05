// src/components/Leaderboard.tsx

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ArrowLeft, Trophy, Medal, Award, Star } from 'lucide-react';
import { Page } from '../App';

// 定义排行榜条目类型
interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    difficulty: 'easy' | 'medium' | 'hard';
    level: number;
    icon: 'Trophy' | 'Medal' | 'Award' | 'Star'; // 用字符串代替组件
}

// 映射字符串图标 → React 组件
const iconMap = {
    Trophy,
    Medal,
    Award,
    Star,
};

const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500"
};

const difficultyNames = {
    easy: "简单",
    medium: "中等",
    hard: "困难"
};

// 存储键名
const STORAGE_KEY = 'puzzle_leaderboard';

// 默认数据（分数为 0）
const DEFAULT_DATA: Omit<LeaderboardEntry, 'icon'>[] = [
    { rank: 1, name: "拼图大师2024", score: 0, difficulty: "hard", level: 15 },
    { rank: 2, name: "拼图向导", score: 0, difficulty: "hard", level: 14 },
    { rank: 3, name: "逻辑君主", score: 0, difficulty: "medium", level: 18 },
    { rank: 4, name: "智力破坏者", score: 0, difficulty: "hard", level: 13 },
    { rank: 5, name: "思维修复者", score: 0, difficulty: "medium", level: 16 },
    { rank: 6, name: "思考坦克", score: 0, difficulty: "medium", level: 15 },
    { rank: 7, name: "策略风暴", score: 0, difficulty: "easy", level: 22 },
    { rank: 8, name: "拼图专家", score: 0, difficulty: "medium", level: 14 },
    { rank: 9, name: "逻辑传奇", score: 0, difficulty: "easy", level: 20 },
    { rank: 10, name: "智力宝盒", score: 0, difficulty: "hard", level: 11 },
];

// 获取排行榜数据
const getLeaderboardData = (): LeaderboardEntry[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        // 首次运行：初始化为默认数据（分数为0）
        resetLeaderboard();
        return getDefaultDataWithIcons();
    }
    try {
        const data: LeaderboardEntry[] = JSON.parse(saved);
        return addIconsToData(data);
    } catch (e) {
        console.error('排行榜数据解析失败，重置为默认值', e);
        resetLeaderboard();
        return getDefaultDataWithIcons();
    }
};

// 保存排行榜数据
const saveLeaderboardData = (data: LeaderboardEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 将所有分数置零
export const resetLeaderboard = () => {
    const resetData = getDefaultDataWithIcons().map(d => ({ ...d, score: 0 }));
    saveLeaderboardData(resetData);
};

// 工具函数：给默认数据加上图标
function getDefaultDataWithIcons(): LeaderboardEntry[] {
    return DEFAULT_DATA.map((item, index) => ({
        ...item,
        icon: (index === 0 ? 'Trophy' : index === 1 ? 'Medal' : index === 2 ? 'Award' : 'Star') as LeaderboardEntry['icon']
    }));
}

// 恢复数据时重新绑定图标
function addIconsToData(data: any[]): LeaderboardEntry[] {
    return data.map(item => ({
        ...item,
        icon: item.icon || 'Star'
    }));
}

// 主组件
export function Leaderboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        setLeaderboardData(getLeaderboardData());
    }, []);

    const handleReset = () => {
        if (window.confirm('确定要将所有分数清零吗？此操作不可撤销！')) {
            resetLeaderboard();
            setLeaderboardData(getLeaderboardData());
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="outline"
                        onClick={() => onNavigate('home')}
                        className="bg-card/80 backdrop-blur-sm"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        返回主页
                    </Button>
                    <h1 className="text-4xl text-primary-foreground flex items-center">
                        <Trophy className="size-10 mr-4 text-yellow-400" />
                        排行榜
                    </h1>
                    <Button variant="outline" size="sm" onClick={handleReset} className="text-red-400">
                        🚫 清零分数
                    </Button>
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                    {/* 2nd Place */}
                    <Card className="bg-card/90 backdrop-blur-sm order-1">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-gray-400 rounded-full p-3 mb-2">
                                <Medal className="size-8 text-white" />
                            </div>
                            <h3 className="text-lg">第2名</h3>
                            <p className="text-2xl">{leaderboardData[1]?.name}</p>
                            <p className="text-xl text-muted-foreground">{leaderboardData[1]?.score.toLocaleString()}</p>
                        </CardHeader>
                    </Card>

                    {/* 1st Place */}
                    <Card className="bg-card/90 backdrop-blur-sm order-2 scale-110 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-yellow-400 rounded-full p-2">
                                <Trophy className="size-6 text-white" />
                            </div>
                        </div>
                        <CardHeader className="text-center pb-4 pt-8">
                            <div className="mx-auto bg-yellow-400 rounded-full p-3 mb-2">
                                <Trophy className="size-8 text-white" />
                            </div>
                            <h3 className="text-lg">第1名</h3>
                            <p className="text-2xl">{leaderboardData[0]?.name}</p>
                            <p className="text-xl text-muted-foreground">{leaderboardData[0]?.score.toLocaleString()}</p>
                        </CardHeader>
                    </Card>

                    {/* 3rd Place */}
                    <Card className="bg-card/90 backdrop-blur-sm order-3">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-amber-600 rounded-full p-3 mb-2">
                                <Award className="size-8 text-white" />
                            </div>
                            <h3 className="text-lg">第3名</h3>
                            <p className="text-2xl">{leaderboardData[2]?.name}</p>
                            <p className="text-xl text-muted-foreground">{leaderboardData[2]?.score.toLocaleString()}</p>
                        </CardHeader>
                    </Card>
                </div>

                {/* Full Leaderboard Table */}
                <Card className="bg-card/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">完整排名</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">排名</TableHead>
                                    <TableHead>玩家</TableHead>
                                    <TableHead>分数</TableHead>
                                    <TableHead>难度</TableHead>
                                    <TableHead>达到关卡</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboardData.map((player) => {
                                    const IconComponent = iconMap[player.icon];
                                    return (
                                        <TableRow key={player.rank} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <span className="mr-2">#{player.rank}</span>
                                                    {player.rank <= 3 && IconComponent && (
                                                        <IconComponent className={`size-4 ${player.rank === 1 ? 'text-yellow-400' :
                                                                player.rank === 2 ? 'text-gray-400' :
                                                                    'text-amber-600'
                                                            }`} />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{player.name}</TableCell>
                                            <TableCell className="text-lg">{player.score.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge className={`${difficultyColors[player.difficulty]} text-white`}>
                                                    {difficultyNames[player.difficulty]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>关卡 {player.level}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Button
                        onClick={() => onNavigate('difficulty')}
                        className="bg-primary hover:bg-primary/90"
                    >
                        立即游玩
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-card/80 backdrop-blur-sm"
                    >
                        查看我的统计
                    </Button>

                    {/* 测试：提交分数按钮 */}
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                            // 获取当前数据
                            const currentData = [...leaderboardData];
                            // 给第1名加分
                            currentData[0] = {
                                ...currentData[0],
                                score: currentData[0].score + 10000
                            };
                            // 保存到 localStorage
                            saveLeaderboardData(currentData);
                            // 更新 UI
                            setLeaderboardData(currentData);
                            // 弹出提示
                            alert(`已为 ${currentData[0].name} 加 10,000 分！`);
                        }}
                    >
                        🎯 测试：加 10,000 分
                    </Button>
                </div>
            </div>
        </div>
    );
}