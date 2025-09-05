// src/components/AuthForm.tsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { register, login } from './regis';
import { Page } from '../App';

type AuthMode = 'login' | 'register';

export function AuthForm({ onNavigate }: { onNavigate: (page: Page) => void }) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (mode === 'register') {
            const result = register(username, password);
            if (result.success) {
                setMode('login');
                setMessage({ text: '注册成功，请登录', type: 'success' });
            } else {
                setMessage({ text: result.message, type: 'error' });
            }
        } else {
            const result = login(username, password);
            if (result.success) {
                setMessage({ text: '登录成功！', type: 'success' });
                setTimeout(() => onNavigate('home'), 500); // 跳转
            } else {
                setMessage({ text: result.message, type: 'error' });
            }
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {mode === 'login' ? '登录' : '注册'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">用户名</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">密码</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {message && (
                            <div className={`text-sm p-2 rounded ${message.type === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            {mode === 'login' ? '登录' : '注册'}
                        </Button>

                        <div className="text-center text-sm">
                            {mode === 'login' ? (
                                <span>
                                    没有账号？{' '}
                                    <button type="button" className="text-primary underline" onClick={() => setMode('register')}>
                                        注册一个
                                    </button>
                                </span>
                            ) : (
                                <span>
                                    已有账号？{' '}
                                    <button type="button" className="text-primary underline" onClick={() => setMode('login')}>
                                        去登录
                                    </button>
                                </span>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}