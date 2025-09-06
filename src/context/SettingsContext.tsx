import React, { createContext, useState, useContext, useMemo, ReactNode, useEffect, useRef } from 'react';

// 定义支持的主题颜色 (使用 HSL 格式，符合你的 shadcn/ui 配置)
export const themes = {
  blue: { 
    '--primary': '221.2 83.2% 53.3%', 
    '--primary-foreground': '210 40% 98%',
    '--gradient-from': '221.2 83.2% 85%',
    '--gradient-to': '221.2 83.2% 75%',
    '--puzzle-border': '221.2 83.2% 60%',
    '--card-bg': '221.2 83.2% 95%',
    '--muted-bg': '221.2 83.2% 90%',
    '--text-primary': '221.2 83.2% 25%',
    '--text-secondary': '221.2 83.2% 40%',
    '--text-muted': '221.2 83.2% 55%'
  },
  green: { 
    '--primary': '142.1 76.2% 36.3%', 
    '--primary-foreground': '142.1 76.2% 96.3%',
    '--gradient-from': '142.1 76.2% 85%',
    '--gradient-to': '142.1 76.2% 75%',
    '--puzzle-border': '142.1 76.2% 50%',
    '--card-bg': '142.1 76.2% 95%',
    '--muted-bg': '142.1 76.2% 90%',
    '--text-primary': '142.1 76.2% 20%',
    '--text-secondary': '142.1 76.2% 35%',
    '--text-muted': '142.1 76.2% 50%'
  },
  purple: { 
    '--primary': '262.1 83.3% 57.8%', 
    '--primary-foreground': '262.1 83.3% 97.8%',
    '--gradient-from': '262.1 83.3% 85%',
    '--gradient-to': '262.1 83.3% 75%',
    '--puzzle-border': '262.1 83.3% 70%',
    '--card-bg': '262.1 83.3% 95%',
    '--muted-bg': '262.1 83.3% 90%',
    '--text-primary': '262.1 83.3% 25%',
    '--text-secondary': '262.1 83.3% 40%',
    '--text-muted': '262.1 83.3% 55%'
  },
  orange: { 
    '--primary': '24.6 95% 53.1%', 
    '--primary-foreground': '24.6 95% 98.1%',
    '--gradient-from': '24.6 95% 85%',
    '--gradient-to': '24.6 95% 75%',
    '--puzzle-border': '24.6 95% 65%',
    '--card-bg': '24.6 95% 95%',
    '--muted-bg': '24.6 95% 90%',
    '--text-primary': '24.6 95% 25%',
    '--text-secondary': '24.6 95% 40%',
    '--text-muted': '24.6 95% 55%'
  },
  black: { 
    '--primary': '0 0% 20%', 
    '--primary-foreground': '0 0% 95%',
    '--gradient-from': '0 0% 25%',
    '--gradient-to': '0 0% 15%',
    '--puzzle-border': '0 0% 40%',
    '--card-bg': '0 0% 90%',
    '--muted-bg': '0 0% 85%',
    '--text-primary': '0 0% 15%',
    '--text-secondary': '0 0% 30%',
    '--text-muted': '0 0% 45%'
  },
};

type ThemeName = keyof typeof themes;

type MusicType = 'classical' | 'ambient' | 'electronic';

interface SettingsState {
  isMusicOn: boolean;
  isSfxOn: boolean;
  theme: ThemeName;
  selectedMusic: MusicType;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setTheme: (theme: ThemeName) => void;
  setMusic: (music: MusicType) => void;
  playSfx: (type: 'dragStart' | 'dragEnd') => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isSfxOn, setIsSfxOn] = useState(true);
  const [theme, setTheme] = useState<ThemeName>('blue');
  const [selectedMusic, setSelectedMusic] = useState<MusicType>('classical');
  
  // 音频引用
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const dragStartSfxRef = useRef<HTMLAudioElement | null>(null);
  const dragEndSfxRef = useRef<HTMLAudioElement | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const toggleMusic = () => {
    setIsMusicOn(prev => {
      const newState = !prev;
      if (newState) {
        playBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
      return newState;
    });
  };
  
  const toggleSfx = () => setIsSfxOn(prev => !prev);
  
  const setMusic = (music: MusicType) => {
    setSelectedMusic(music);
    // 如果音乐正在播放，重新开始播放新选择的音乐
    if (isMusicOn) {
      stopBackgroundMusic();
      setTimeout(() => playBackgroundMusic(), 100);
    }
  };

  const applyTheme = (themeName: ThemeName) => {
    const themeColors = themes[themeName];
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    setTheme(themeName);
  };

  // 播放音效
  const playSfx = (type: 'dragStart' | 'dragEnd') => {
    if (!isSfxOn) return;
    
    try {
      let audioRef: React.MutableRefObject<HTMLAudioElement | null>;
      
      if (type === 'dragStart') {
        audioRef = dragStartSfxRef;
      } else {
        audioRef = dragEndSfxRef;
      }
      
      if (!audioRef.current) {
        // 创建音频元素（使用Web Audio API生成简单音效）
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音效参数
        if (type === 'dragStart') {
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        } else {
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        }
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.warn('无法播放音效:', error);
    }
  };

  // 生成不同类型的音乐
  const generateMusic = (musicType: MusicType) => {
    const audioContext = audioContextRef.current!;
    
    switch (musicType) {
      case 'classical':
        // 欢快的古典音乐风格 - 扩展的音阶和更多变化
        return {
          melody: [
            // 主音阶
            261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25,
            // 高八度
            523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50,
            // 装饰音
            311.13, 369.99, 415.30, 466.16, 554.37, 622.25, 739.99, 830.61
          ],
          harmony: [
            // 基础和弦
            130.81, 164.81, 196.00, 246.94,
            // 扩展和弦
            174.61, 220.00, 261.63, 329.63,
            // 低音变化
            98.00, 123.47, 146.83, 185.00
          ],
          noteDuration: 600,
          waveType: 'sine' as OscillatorType,
          volume: 0.04,
          style: 'cheerful'
        };
      case 'ambient':
        // 轻松惬意的环境音乐 - 更多音色变化
        return {
          melody: [
            // 五声音阶扩展
            261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25,
            // 高音区
            698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51,
            // 中音区变化
            220.00, 246.94, 277.18, 311.13, 349.23, 392.00, 440.00, 493.88
          ],
          harmony: [
            // 温暖和声
            174.61, 220.00, 261.63, 329.63,
            // 扩展和声
            130.81, 164.81, 196.00, 246.94,
            // 高音和声
            349.23, 440.00, 523.25, 659.25
          ],
          noteDuration: 1000,
          waveType: 'triangle' as OscillatorType,
          volume: 0.03,
          style: 'relaxing'
        };
      case 'electronic':
        // 紧张刺激的电子音乐 - 更多音效变化
        return {
          melody: [
            // A小调音阶扩展
            277.18, 311.13, 349.23, 415.30, 466.16, 523.25, 622.25, 698.46,
            // 高音区
            783.99, 880.00, 987.77, 1108.73, 1244.51, 1396.91, 1567.98,
            // 低音区
            138.59, 155.56, 174.61, 207.65, 233.08, 261.63, 311.13, 349.23,
            // 装饰音
            369.99, 415.30, 466.16, 523.25, 587.33, 659.25, 739.99, 830.61
          ],
          harmony: [
            // 紧张和声
            138.59, 174.61, 220.00, 277.18,
            // 扩展和声
            185.00, 233.08, 293.66, 369.99,
            // 低音和声
            92.50, 116.54, 146.83, 185.00
          ],
          noteDuration: 300,
          waveType: 'sawtooth' as OscillatorType,
          volume: 0.035,
          style: 'intense'
        };
      default:
        return {
          melody: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
          harmony: [130.81, 164.81, 196.00, 246.94],
          noteDuration: 600,
          waveType: 'sine' as OscillatorType,
          volume: 0.04,
          style: 'cheerful'
        };
    }
  };

  // 创建音频效果
  const createAudioEffects = (audioContext: AudioContext) => {
    // 创建混响效果
    const reverb = audioContext.createConvolver();
    const reverbBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 2, audioContext.sampleRate);
    const reverbData = reverbBuffer.getChannelData(0);
    for (let i = 0; i < reverbData.length; i++) {
      reverbData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbData.length, 2);
    }
    reverb.buffer = reverbBuffer;
    
    // 创建低通滤波器
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    return { reverb, filter };
  };

  // 播放单个音符
  const playNote = (audioContext: AudioContext, frequency: number, duration: number, volume: number, waveType: OscillatorType, effects: any) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = waveType;
    
    // 添加包络
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    // 连接音频链
    oscillator.connect(gainNode);
    gainNode.connect(effects.filter);
    effects.filter.connect(effects.reverb);
    effects.reverb.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // 播放背景音乐
  const playBackgroundMusic = () => {
    if (!isMusicOn) return;
    
    // 先停止之前的音乐
    stopBackgroundMusic();
    
    try {
      // 创建新的音频上下文
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const musicConfig = generateMusic(selectedMusic);
      const effects = createAudioEffects(audioContextRef.current);
      
      let melodyIndex = 0;
      let harmonyIndex = 0;
      let beatCount = 0;
      let phraseCount = 0; // 乐句计数器
      let lastMelodyFreq = 0; // 上一个旋律音符
      
      const playBeat = () => {
        if (!isMusicOn || !audioContextRef.current) return;
        
        const currentTime = audioContextRef.current.currentTime;
        
        // 每16拍开始一个新的乐句，增加变化
        if (beatCount % 16 === 0) {
          phraseCount++;
          // 随机选择新的起始位置
          melodyIndex = Math.floor(Math.random() * musicConfig.melody.length);
          harmonyIndex = Math.floor(Math.random() * musicConfig.harmony.length);
        }
        
        // 播放主旋律 - 增加随机性
        if (beatCount % 2 === 0) {
          let melodyFreq;
          
          // 根据音乐类型添加不同的随机性
          if (musicConfig.style === 'cheerful') {
            // 欢快音乐：偶尔跳跃到高音
            if (Math.random() < 0.3) {
              melodyFreq = musicConfig.melody[Math.floor(Math.random() * musicConfig.melody.length)];
            } else {
              melodyFreq = musicConfig.melody[melodyIndex];
              melodyIndex = (melodyIndex + 1) % musicConfig.melody.length;
            }
          } else if (musicConfig.style === 'relaxing') {
            // 惬意音乐：平滑的音符变化
            const nextIndex = (melodyIndex + (Math.random() < 0.7 ? 1 : -1) + musicConfig.melody.length) % musicConfig.melody.length;
            melodyFreq = musicConfig.melody[nextIndex];
            melodyIndex = nextIndex;
          } else {
            // 刺激音乐：更多跳跃和变化
            if (Math.random() < 0.4) {
              melodyFreq = musicConfig.melody[Math.floor(Math.random() * musicConfig.melody.length)];
            } else {
              melodyFreq = musicConfig.melody[melodyIndex];
              melodyIndex = (melodyIndex + 1) % musicConfig.melody.length;
            }
          }
          
          // 避免重复相同的音符
          if (melodyFreq !== lastMelodyFreq) {
            playNote(audioContextRef.current, melodyFreq, musicConfig.noteDuration / 1000, musicConfig.volume, musicConfig.waveType, effects);
            lastMelodyFreq = melodyFreq;
          }
        }
        
        // 播放和声 - 增加变化
        if (beatCount % 4 === 0) {
          let harmonyFreq;
          
          // 随机选择和声音符
          if (Math.random() < 0.6) {
            harmonyFreq = musicConfig.harmony[harmonyIndex];
            harmonyIndex = (harmonyIndex + 1) % musicConfig.harmony.length;
          } else {
            harmonyFreq = musicConfig.harmony[Math.floor(Math.random() * musicConfig.harmony.length)];
          }
          
          playNote(audioContextRef.current, harmonyFreq, musicConfig.noteDuration / 1000, musicConfig.volume * 0.6, musicConfig.waveType, effects);
        }
        
        // 添加装饰音（随机）
        if (Math.random() < 0.2) {
          const decorationFreq = musicConfig.melody[Math.floor(Math.random() * musicConfig.melody.length)];
          playNote(audioContextRef.current, decorationFreq, musicConfig.noteDuration / 2000, musicConfig.volume * 0.3, musicConfig.waveType, effects);
        }
        
        // 动态节奏变化
        let nextBeatDelay = musicConfig.noteDuration;
        
        if (musicConfig.style === 'intense') {
          // 紧张刺激的音乐有更复杂的节奏
          if (beatCount % 8 < 4) {
            nextBeatDelay = musicConfig.noteDuration * (0.3 + Math.random() * 0.4);
          } else {
            nextBeatDelay = musicConfig.noteDuration * (0.8 + Math.random() * 0.4);
          }
        } else if (musicConfig.style === 'relaxing') {
          // 轻松惬意的音乐有更慢的节奏
          nextBeatDelay = musicConfig.noteDuration * (1.2 + Math.random() * 0.6);
        } else {
          // 欢快音乐有适中的节奏变化
          nextBeatDelay = musicConfig.noteDuration * (0.8 + Math.random() * 0.4);
        }
        
        beatCount++;
        
        // 使用ref来存储定时器，以便可以清除
        musicIntervalRef.current = setTimeout(playBeat, nextBeatDelay);
      };
      
      playBeat();
    } catch (error) {
      console.warn('无法播放背景音乐:', error);
    }
  };

  // 停止背景音乐
  const stopBackgroundMusic = () => {
    // 清除定时器
    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    
    // 关闭音频上下文
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };
  
  // 初始化时应用默认主题
  useEffect(() => {
    applyTheme('blue');
  }, []);

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const value = useMemo(() => ({
    isMusicOn,
    isSfxOn,
    theme,
    selectedMusic,
    toggleMusic,
    toggleSfx,
    setTheme: applyTheme,
    setMusic,
    playSfx,
    playBackgroundMusic,
    stopBackgroundMusic,
  }), [isMusicOn, isSfxOn, theme, selectedMusic]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};