import React from 'react';
import { Trophy, Flame, Zap, ShieldCheck, Sparkles, BookOpen, Star } from 'lucide-react';
import { Language, UserStats } from './types';

interface StatsProps {
  stats: UserStats;
  lang: Language;
}

export const StatsOverview: React.FC<StatsProps> = ({ stats, lang }) => {
  const badges = [
    {
      id: 'novice',
      nameHy: 'Սկսնակ Լեզվաբան',
      nameRu: 'Начинающий лингвист',
      icon: Star,
      unlocked: stats.totalXP >= 50,
      reqHy: '50+ XP',
      reqRu: '50+ XP',
    },
    {
      id: 'sorting_master',
      nameHy: 'Էքսպրես Վարպետ',
      nameRu: 'Мастер Экспресса',
      icon: Zap,
      unlocked: stats.sortingScore >= 100,
      reqHy: '100+ միավոր Էքսպրեսում',
      reqRu: '100+ очков в Экспрессе',
    },
    {
      id: 'detective_pro',
      nameHy: 'Գաղտնի Դետեկտիվ',
      nameRu: 'Секретный детектив',
      icon: ShieldCheck,
      unlocked: stats.detectiveScore >= 100,
      reqHy: '100+ միավոր Դետեկտիվում',
      reqRu: '100+ очков в Детективе',
    },
    {
      id: 'boss_conqueror',
      nameHy: 'Բոսս Նվաճող',
      nameRu: 'Завоеватель босса',
      icon: Trophy,
      unlocked: stats.bossLevel >= 10,
      reqHy: 'Բոսսի Հաղթանակ',
      reqRu: 'Победа над боссом',
    },
  ];

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-300" />
          <span>{lang === 'hy' ? 'Քո Առաջընթացը և Նվաճումները' : 'Твой прогресс и достижения'}</span>
        </h3>
        <span className="text-xs text-pink-200 font-bold">{stats.totalXP} Total XP</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-2 transition-all ${
                b.unlocked
                  ? 'bg-gradient-to-b from-yellow-500/20 to-orange-500/20 border-amber-400/50 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/40 grayscale'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  b.unlocked ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/10 text-white/30'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-black block">
                  {lang === 'hy' ? b.nameHy : b.nameRu}
                </span>
                <span className="text-[10px] text-pink-200/80">
                  {lang === 'hy' ? b.reqHy : b.reqRu}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
