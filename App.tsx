import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { TheoryView } from './TheoryView';
import { GameSorting } from './GameSorting';
import { GameDetective } from './GameDetective';
import { GameTransformer } from './GameTransformer';
import { GameSentence } from './GameSentence';
import { GameBoss } from './GameBoss';
import { StatsOverview } from './Stats';
import { Language, UserStats } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('theory');
  const [lang, setLang] = useState<Language>('hy'); // Armenian default
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persistent User Statistics
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('spanish_gender_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      sortingScore: 0,
      detectiveScore: 0,
      transformerScore: 0,
      sentenceScore: 0,
      bossLevel: 1,
      totalXP: 0,
      streakDays: 1,
      unlockedBadges: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('spanish_gender_stats', JSON.stringify(stats));
  }, [stats]);

  const handleUpdateStats = (newStatsPartial: Partial<UserStats>) => {
    setStats((prev) => ({
      ...prev,
      ...newStatsPartial,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-600 via-orange-500 to-red-600 text-white font-sans antialiased selection:bg-pink-300 selection:text-slate-900 relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Decorative Mesh Orbs (Pink, Orange, Red) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-red-600/30 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 flex-1">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          stats={stats}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
          {/* Active View */}
          {activeTab === 'theory' && (
            <TheoryView lang={lang} onStartGame={(gameId) => setActiveTab(gameId)} />
          )}

          {activeTab === 'game_sorting' && (
            <GameSorting lang={lang} stats={stats} onUpdateStats={handleUpdateStats} />
          )}

          {activeTab === 'game_detective' && (
            <GameDetective lang={lang} stats={stats} onUpdateStats={handleUpdateStats} />
          )}

          {activeTab === 'game_transformer' && (
            <GameTransformer lang={lang} stats={stats} onUpdateStats={handleUpdateStats} />
          )}

          {activeTab === 'game_sentence' && (
            <GameSentence lang={lang} stats={stats} onUpdateStats={handleUpdateStats} />
          )}

          {activeTab === 'game_boss' && (
            <GameBoss lang={lang} stats={stats} onUpdateStats={handleUpdateStats} />
          )}

          {/* Stats Bar at bottom */}
          <StatsOverview stats={stats} lang={lang} />
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-rose-100/70 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <p>
          {lang === 'hy'
            ? 'Իսպաներենի սեռերի ուսուցում (El / La) • Հայերեն թարգմանությամբ'
            : 'Изучение родов в испанском языке (El / La) • С армянским переводом'}
        </p>
      </footer>
    </div>
  );
}
