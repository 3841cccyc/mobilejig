// src/components/regis.ts
import { User } from './user';

const STORAGE_USERS_KEY = 'puzzle_users';
const STORAGE_CURRENT_USER_KEY = 'puzzle_current_user';

// 获取所有用户
function getUsers(): User[] {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    return saved ? JSON.parse(saved) : [];
}

// 保存用户列表
function saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// 注册
export function register(username: string, password: string): { success: boolean; message: string } {
    const users = getUsers();

    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
        return { success: false, message: '用户名已存在' };
    }

    // 创建新用户
    const newUser: User = {
        id: Date.now().toString(), // 简单 ID 生成
        username,
        password, 
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: '注册成功！' };
}

// 登录
export function login(username: string, password: string): { success: boolean; message: string; user: User | null } {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return { success: false, message: '用户不存在', user: null };
    }

    if (user.password !== password) {
        return { success: false, message: '密码错误', user: null };
    }

    // 登录成功，保存当前用户
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, user.id);

    return { success: true, message: '登录成功！', user };
}

// 获取当前登录用户
export function getCurrentUser(): User | null {
    const userId = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!userId) return null;

    const users = getUsers();
    return users.find(u => u.id === userId) || null;
}

// 登出
export function logout() {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
}