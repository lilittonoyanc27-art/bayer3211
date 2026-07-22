import React, { useState, useEffect } from 'react';
import { Zap, RotateCcw, Volume2, Trophy, Flame, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Language, UserStats, Gender } from './types';
import { ALL_DICTIONARY_WORDS } from './theoryData';
import { soundFx, speakSpanish } from './audioUtils';
import confetti from 'canvas-confetti';

interface GameSortingProps {
  lang: Language;
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const GameSorting: React.FC<GameSortingProps> = ({ lang, stats, onUpdateStats }) => {
  const [wordsList, setWordsList] = useState(() => [...ALL_DICTIONARY_WORDS].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentWord = wordsList[currentIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('ended');
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            soundFx.playFanfare();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    soundFx.playClick();
    setWordsList([...ALL_DICTIONARY_WORDS].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(45);
    setGameState('playing');
    setFeedback(null);
  };

  const handleChoice = (chosenGender: Gender) => {
    if (gameState !== 'playing' || !currentWord) return;

    // Check correctness (note: agua takes 'el' in singular)
    const effectiveGender = currentWord.word === 'agua' ? 'el' : currentWord.gender;
    const isCorrect = chosenGender === effectiveGender;

    if (isCorrect) {
      soundFx.playSuccess();
      const comboBonus = streak >= 5 ? 20 : streak >= 3 ? 15 : 10;
      const newScore = score + comboBonus;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setFeedback('correct');

      // Pronounce word
      speakSpanish(`${effectiveGender} ${currentWord.word}`);
    } else {
      soundFx.playError();
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 < wordsList.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Re-shuffle if ran out of words
        setWordsList([...ALL_DICTIONARY_WORDS].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
      }
    }, 400);
  };

  // Save score on end
  useEffect(() => {
    if (gameState === 'ended') {
      const addedXP = score;
      onUpdateStats({
        sortingScore: Math.max(stats.sortingScore, score),
        totalXP: stats.totalXP + addedXP,
      });
    }
  }, [gameState]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-2xl text-black shadow-lg">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">
              {lang === 'hy' ? '1. Էքսպրես Տեսակավորում (El թե La)' : '1. Экспресс-сортировка (El или La)'}
            </h2>
            <p className="text-xs text-rose-200">
              {lang === 'hy'
                ? 'Որոշիր բառի սեռը հնարավորինս արագ (45 վայրկյան):'
                : 'Определи род слова как можно быстрее за 45 секунд.'}
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center space-x-4 bg-white/10 px-4 py-2 rounded-2xl border border-white/15">
            <div className="text-center">
              <span className="text-[10px] text-pink-200 block">Ժամանակ</span>
              <span className="text-xl font-black text-amber-300">{timeLeft}վ</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] text-pink-200 block">Միավոր</span>
              <span className="text-xl font-black text-emerald-300">{score}</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center text-orange-400 font-bold space-x-1">
              <Flame className="w-5 h-5 fill-current animate-bounce" />
              <span>x{streak}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Game Arena */}
      {gameState === 'idle' && (
        <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 via-orange-500 to-amber-400 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-pink-500/20">
            <Zap className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-white">
              {lang === 'hy' ? 'Պատրա՞ստ ես մարտահրավերին' : 'Готов к челленджу?'}
            </h3>
            <p className="text-sm text-pink-100/80">
              {lang === 'hy'
                ? 'Էկրանին կհայտնվեն իսպաներեն բառեր: Ընտրիր «EL» (արական) կամ «LA» (իգական): Հավաքիր առավելագույն միավորներ 45 վայրկյանում:'
                : 'На экране будут появляться испанские слова. Выбирай «EL» (мужской) или «LA» (женский). Набери максимум очков за 45 секунд!'}
            </p>
          </div>

          <button
            id="start-sorting-game-btn"
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-500/30 text-lg transition-all hover:scale-105 active:scale-95"
          >
            {lang === 'hy' ? 'Սկսել Խաղը (45վ)' : 'Начать игру (45с)'}
          </button>
        </div>
      )}

      {gameState === 'playing' && currentWord && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-8 shadow-2xl relative overflow-hidden">
          {/* Card feedback glow overlay */}
          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/20 pointer-events-none animate-pulse border-4 border-emerald-400 rounded-3xl" />
          )}
          {feedback === 'wrong' && (
            <div className="absolute inset-0 bg-rose-500/20 pointer-events-none animate-pulse border-4 border-rose-400 rounded-3xl" />
          )}

          <div className="space-y-3">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-pink-200 font-bold uppercase tracking-wider">
              {lang === 'hy' ? `Բառ ${currentIndex + 1}` : `Слово ${currentIndex + 1}`}
            </span>

            {/* Main word display */}
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {currentWord.word}
            </h3>

            <p className="text-lg font-medium text-amber-200/90">
              ({lang === 'hy' ? currentWord.translationHy : currentWord.translationRu})
            </p>
          </div>

          {/* Action buttons EL vs LA */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto pt-4">
            <button
              id="sorting-btn-el"
              onClick={() => handleChoice('el')}
              className="py-6 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-2xl rounded-3xl shadow-xl shadow-blue-600/30 border border-blue-300/40 transition-all transform active:scale-95 flex flex-col items-center justify-center space-y-1"
            >
              <span className="flex items-center space-x-1">
                <ArrowLeft className="w-5 h-5 opacity-70" />
                <span>EL ♂</span>
              </span>
              <span className="text-xs font-normal text-blue-200/80">
                {lang === 'hy' ? 'Արական' : 'Мужской'}
              </span>
            </button>

            <button
              id="sorting-btn-la"
              onClick={() => handleChoice('la')}
              className="py-6 px-4 bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 text-white font-black text-2xl rounded-3xl shadow-xl shadow-pink-600/30 border border-pink-300/40 transition-all transform active:scale-95 flex flex-col items-center justify-center space-y-1"
            >
              <span className="flex items-center space-x-1">
                <span>LA ♀</span>
                <ArrowRight className="w-5 h-5 opacity-70" />
              </span>
              <span className="text-xs font-normal text-pink-200/80">
                {lang === 'hy' ? 'Իգական' : 'Женский'}
              </span>
            </button>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-amber-400 text-slate-950 rounded-full mx-auto flex items-center justify-center shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">
              {lang === 'hy' ? 'Ժամանակն Ավարտվեց 🏆' : 'Время вышло! 🏆'}
            </h3>
            <p className="text-sm text-pink-200">
              {lang === 'hy' ? 'Ահա քո արդյունքները. գերազանց աշխատանք:' : 'Вот твои результаты. Отличная работа!'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="p-3">
              <span className="text-xs text-pink-200 block">{lang === 'hy' ? 'Վերջնական Միավոր' : 'Финальный счет'}</span>
              <span className="text-2xl font-black text-amber-300">{score}</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-pink-200 block">{lang === 'hy' ? 'Առավելագույն Ստրիկ' : 'Макс. Стрик'}</span>
              <span className="text-2xl font-black text-orange-400">x{maxStreak}</span>
            </div>
          </div>

          <button
            id="play-again-sorting-btn"
            onClick={startGame}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 via-orange-500 to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{lang === 'hy' ? 'Կրկին Խաղալ' : 'Играть снова'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
