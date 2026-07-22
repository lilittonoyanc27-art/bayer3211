import React from 'react';
import { BookOpen, Zap, Trophy, ShieldCheck, Flame, Volume2, VolumeX, Sparkles, Languages } from 'lucide-react';
import { Language, UserStats } from './types';
import { soundFx } from './audioUtils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  soundEnabled,
  setSoundEnabled,
  stats,
}) => {
  const navTabs = [
    {
      id: 'theory',
      labelHy: 'Տեսություն',
      labelRu: 'Теория',
      icon: BookOpen,
      badge: 'Գիտելիք',
    },
    {
      id: 'game_sorting',
      labelHy: '1. Էքսպրես Տեսակավորում',
      labelRu: '1. Экспресс-сортировка',
      icon: Zap,
      badge: 'El/La',
    },
    {
      id: 'game_detective',
      labelHy: '2. Բացառությունների Դետեկտիվ',
      labelRu: '2. Детектив исключений',
      icon: ShieldCheck,
      badge: 'Գաղտնիքներ',
    },
    {
      id: 'game_transformer',
      labelHy: '3. Զույգեր & Մեմորի',
      labelRu: '3. Пары и Мемори',
      icon: Sparkles,
      badge: 'Match',
    },
    {
      id: 'game_sentence',
      labelHy: '4. Նախադասություններ',
      labelRu: '4. Предложения',
      icon: BookOpen,
      badge: 'Контекст',
    },
    {
      id: 'game_boss',
      labelHy: '5. Գենդերային Մարտ',
      labelRu: '5. Босс-Викторина',
      icon: Trophy,
      badge: 'Boss',
    },
  ];

  return (
    <header className="w-full bg-black/30 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-pink-500/30 border border-white/20">
              <span className="font-extrabold text-xl tracking-tight text-white">ES</span>
            </div>
            <div>
              <h1 id="app-main-title" className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-white">
                {lang === 'hy' ? 'Իսպաներենի Սեռեր (El / La)' : 'Род в испанском (El / La)'}
              </h1>
              <p className="text-xs text-rose-200 font-medium">
                {lang === 'hy' ? 'Հայերենից Իսպաներեն ուսուցում • 5 Ինտերակտիվ Խաղ' : 'Обучение с армянским переводом • 5 Игр'}
              </p>
            </div>
          </div>

          {/* Controls: Stats, Sound & Language Toggle */}
          <div className="flex items-center space-x-3">
            {/* Streak & XP Badges */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs font-semibold">
              <div className="flex items-center text-amber-300 space-x-1">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
                <span>{stats.streakDays} {lang === 'hy' ? 'օր' : 'дн.'}</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center text-yellow-300 space-x-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>{stats.totalXP} XP</span>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              id="language-toggle-btn"
              onClick={() => {
                soundFx.playClick();
                setLang(lang === 'hy' ? 'ru' : 'hy');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 border border-pink-300/30 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Լեզու / Язык"
            >
              <Languages className="w-3.5 h-3.5 text-pink-200" />
              <span>{lang === 'hy' ? '🇦🇲 Հայերեն' : '🇷🇺 Русский'}</span>
            </button>

            {/* Mute/Sound button */}
            <button
              id="sound-toggle-btn"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundFx.playClick();
              }}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white transition-all active:scale-95"
              title={soundEnabled ? 'Ձայնն անջատել' : 'Ձայնը միացնել'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-rose-300" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-2 overflow-x-auto mt-4 pb-1 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 border border-pink-300/40'
                    : 'bg-white/10 text-rose-100 hover:bg-white/20 hover:text-white border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-pink-200'}`} />
                <span>{lang === 'hy' ? tab.labelHy : tab.labelRu}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                    isActive ? 'bg-black/30 text-yellow-200' : 'bg-black/20 text-white/70'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
