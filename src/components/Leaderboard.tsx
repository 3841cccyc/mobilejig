import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ArrowLeft, Trophy, Medal, Award, Star } from 'lucide-react';
import { Page } from '../App';

interface LeaderboardProps {
    onNavigate: (page: Page) => void;
}

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

export function Leaderboard({ onNavigate }: LeaderboardProps) {
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        // 从localStorage加载排行榜数据
        const data = localStorage.getItem('puzzle-leaderboard');
        if (data) {
            setLeaderboardData(JSON.parse(data));
        }
    }, []);

    const topThree = leaderboardData.slice(0, 3);
    const remainingPlayers = leaderboardData.slice(3);

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
                    <div></div>
                </div>

                {/* Top 3 Podium */}
                {topThree.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <Card className="bg-card/90 backdrop-blur-sm order-1">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto bg-gray-400 rounded-full p-3 mb-2">
                                        <Medal className="size-8 text-white" />
                                    </div>
                                    <h3 className="text-lg">第2名</h3>
                                    <p className="text-2xl">{topThree[1].name}</p>
                                    <p className="text-xl text-muted-foreground">{topThree[1].score.toLocaleString()}</p>
                                </CardHeader>
                            </Card>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
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
                                    <p className="text-2xl">{topThree[0].name}</p>
                                    <p className="text-xl text-muted-foreground">{topThree[0].score.toLocaleString()}</p>
                                </CardHeader>
                            </Card>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <Card className="bg-card/90 backdrop-blur-sm order-3">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto bg-amber-600 rounded-full p-3 mb-2">
                                        <Award className="size-8 text-white" />
                                    </div>
                                    <h3 className="text-lg">第3名</h3>
                                    <p className="text-2xl">{topThree[2].name}</p>
                                    <p className="text-xl text-muted-foreground">{topThree[2].score.toLocaleString()}</p>
                                </CardHeader>
                            </Card>
                        )}
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <Card className="bg-card/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">完整排名</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaderboardData.length > 0 ? (
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
                                        let IconComponent = Star;
                                        if (player.rank === 1) IconComponent = Trophy;
                                        if (player.rank === 2) IconComponent = Medal;
                                        if (player.rank === 3) IconComponent = Award;

                                        return (
                                            <TableRow key={player.rank} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <span className="mr-2">#{player.rank}</span>
                                                        {player.rank <= 3 && (
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
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                暂无排行榜数据，快去玩游戏吧！
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <Button
                        onClick={() => onNavigate('difficulty')}
                        className="bg-primary hover:bg-primary/90"
                    >
                        立即游玩
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-card/80 backdrop-blur-sm"
                        onClick={() => {
                            localStorage.removeItem('puzzle-leaderboard');
                            setLeaderboardData([]);
                        }}
                    >
                        清空排行榜
                    </Button>
                </div>
            </div>
        </div>
    );
}