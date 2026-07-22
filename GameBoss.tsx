import React, { useState } from 'react';
import { Trophy, Heart, Sparkles, Shield, RotateCcw, HelpCircle, Zap, AlertTriangle } from 'lucide-react';
import { Language, UserStats } from './types';
import { BOSS_QUESTIONS } from './gameData';
import { soundFx, speakSpanish } from './audioUtils';
import confetti from 'canvas-confetti';

interface GameBossProps {
  lang: Language;
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const GameBoss: React.FC<GameBossProps> = ({ lang, stats, onUpdateStats }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [playerHearts, setPlayerHearts] = useState(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Lifelines state
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedTheoryHint, setUsedTheoryHint] = useState(false);
  const [usedExtraHeart, setUsedExtraHeart] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [showHintText, setShowHintText] = useState(false);

  const q = BOSS_QUESTIONS[questionIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered || gameState !== 'playing' || disabledOptions.includes(index)) return;

    soundFx.playClick();
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === q.correctIndex) {
      soundFx.playSuccess();
      const damage = 12.5;
      const newBossHp = Math.max(0, bossHp - damage);
      setBossHp(newBossHp);
      setScore((prev) => prev + 50);

      if (newBossHp <= 0 || questionIndex + 1 === BOSS_QUESTIONS.length) {
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 120, spread: 90 });
          soundFx.playFanfare();
          onUpdateStats({
            bossLevel: Math.max(stats.bossLevel, 10),
            totalXP: stats.totalXP + score + 200,
          });
        }, 1000);
      }
    } else {
      soundFx.playError();
      const newHearts = playerHearts - 1;
      setPlayerHearts(newHearts);

      if (newHearts <= 0) {
        setTimeout(() => {
          setGameState('lost');
        }, 1000);
      }
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    setSelectedOption(null);
    setIsAnswered(false);
    setDisabledOptions([]);
    setShowHintText(false);

    if (questionIndex + 1 < BOSS_QUESTIONS.length && bossHp > 0) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  // Lifelines
  const useFiftyFifty = () => {
    if (usedFiftyFifty || isAnswered) return;
    soundFx.playClick();
    setUsedFiftyFifty(true);

    const wrongIndices = q.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== q.correctIndex);

    // Disable 2 random wrong options
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(shuffledWrong);
  };

  const useTheoryHint = () => {
    if (usedTheoryHint || isAnswered) return;
    soundFx.playClick();
    setUsedTheoryHint(true);
    setShowHintText(true);
  };

  const useExtraHeart = () => {
    if (usedExtraHeart || playerHearts >= 3) return;
    soundFx.playSuccess();
    setUsedExtraHeart(true);
    setPlayerHearts((prev) => Math.min(3, prev + 1));
  };

  const restartBoss = () => {
    soundFx.playClick();
    setQuestionIndex(0);
    setBossHp(100);
    setPlayerHearts(3);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setGameState('playing');
    setUsedFiftyFifty(false);
    setUsedTheoryHint(false);
    setUsedExtraHeart(false);
    setDisabledOptions([]);
    setShowHintText(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Boss Header / Arena Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-rose-900/60 to-orange-950/80 backdrop-blur-md rounded-3xl p-6 border border-red-500/40 text-white space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-red-600/40 border border-red-400">
              👹
            </div>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-red-200">
                {lang === 'hy' ? '5. Գենդերային Բոսս Մարտահրավեր' : '5. Босс-Викторина: Грамматическая Арена'}
              </h2>
              <span className="text-xs text-rose-200">
                {lang === 'hy' ? `Մակարդակ ${questionIndex + 1} / ${BOSS_QUESTIONS.length}` : `Уровень ${questionIndex + 1} из ${BOSS_QUESTIONS.length}`}
              </span>
            </div>
          </div>

          {/* Player Hearts & XP */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-5 h-5 ${
                    heart <= playerHearts
                      ? 'text-rose-500 fill-rose-500 animate-pulse'
                      : 'text-gray-600 fill-gray-700'
                  }`}
                />
              ))}
            </div>

            <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-black text-amber-300">
              {score} XP
            </div>
          </div>
        </div>

        {/* Boss Health Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-red-300 flex items-center space-x-1">
              <span>👹 El Gran Dragón Gramatical (Բոսս)</span>
            </span>
            <span className="text-amber-300">{Math.round(bossHp)}% HP</span>
          </div>

          <div className="w-full bg-black/60 h-4 rounded-full p-0.5 border border-red-500/30 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${bossHp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lifelines Bar */}
      {gameState === 'playing' && (
        <div className="flex items-center justify-center space-x-3 bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs font-bold">
          <span className="text-pink-200 mr-2">{lang === 'hy' ? 'Օգնություն:' : 'Помощь:'}</span>

          <button
            id="lifeline-5050"
            disabled={usedFiftyFifty || isAnswered}
            onClick={useFiftyFifty}
            className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 disabled:opacity-30 border border-purple-400/40 rounded-xl text-purple-200 transition-all active:scale-95 flex items-center space-x-1"
          >
            <span>50:50</span>
          </button>

          <button
            id="lifeline-hint"
            disabled={usedTheoryHint || isAnswered}
            onClick={useTheoryHint}
            className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 disabled:opacity-30 border border-amber-400/40 rounded-xl text-amber-200 transition-all active:scale-95 flex items-center space-x-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'hy' ? 'Տեսություն' : 'Теория'}</span>
          </button>

          <button
            id="lifeline-heart"
            disabled={usedExtraHeart || playerHearts >= 3}
            onClick={useExtraHeart}
            className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 disabled:opacity-30 border border-rose-400/40 rounded-xl text-rose-200 transition-all active:scale-95 flex items-center space-x-1"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>+1 ❤️</span>
          </button>
        </div>
      )}

      {/* Playing Arena */}
      {gameState === 'playing' && q && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/15 space-y-6 shadow-2xl">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-2">
            <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-200 rounded-full text-xs font-bold">
              {q.category}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
              {q.questionSpanish}
            </h3>
            <p className="text-xs text-amber-200/90 font-medium">
              ({lang === 'hy' ? q.questionHy : q.questionRu})
            </p>

            {showHintText && (
              <p className="text-xs text-amber-300 bg-black/40 p-3 rounded-xl border border-amber-500/30 mt-2 animate-fadeIn">
                💡 {lang === 'hy' ? q.explanationHy : q.explanationRu}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {q.options.map((opt, idx) => {
              const isDisabled = disabledOptions.includes(idx);
              const isSelected = selectedOption === idx;
              const isCorrect = idx === q.correctIndex;

              let btnClass = 'bg-white/10 text-white hover:bg-white/20 border-white/15';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-300 shadow-lg';
                } else if (isSelected) {
                  btnClass = 'bg-rose-600 text-white border-rose-300 shadow-lg';
                }
              } else if (isSelected) {
                btnClass = 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered || isDisabled}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl text-sm font-bold border text-left transition-all flex items-center justify-between ${
                    isDisabled ? 'opacity-20 pointer-events-none' : ''
                  } ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <span className="text-lg">✅</span>}
                  {isAnswered && isSelected && !isCorrect && <span className="text-lg">❌</span>}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-pink-100">
                <span className="font-bold text-amber-300 block mb-1">
                  {lang === 'hy' ? 'Քերականական Պարզաբանում:' : 'Грамматическое пояснение:'}
                </span>
                {lang === 'hy' ? q.explanationHy : q.explanationRu}
              </div>

              <button
                id="boss-next-btn"
                onClick={handleNextQuestion}
                className="w-full py-4 bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === 'hy' ? 'Հաջորդ Հարվածը ⚔️' : 'Следующий удар ⚔️'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Won Screen */}
      {gameState === 'won' && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl">
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl animate-bounce">
            👑
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">
              {lang === 'hy' ? 'ՀԱՂԹԱՆԱԿ! ԲՈՍՍԸ ՊԱՐՏՎԵՑ! 🏆' : 'ПОБЕДА! БОСС ПОВЕРЖЕН! 🏆'}
            </h3>
            <p className="text-sm text-pink-200">
              {lang === 'hy'
                ? 'Դուք փայլուն տիրապետում եք իսպաներենի բոլոր սեռերին, կանոններին և բացառություններին:'
                : 'Вы блестяще владеете всеми родами, правилами и исключениями испанского языка!'}
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 max-w-xs mx-auto">
            <span className="text-xs text-pink-200 block">{lang === 'hy' ? 'Ընդհանուր Վաստակած' : 'Всего заработано'}</span>
            <span className="text-3xl font-black text-amber-300">+{score + 200} XP</span>
          </div>

          <button
            id="restart-won-boss-btn"
            onClick={restartBoss}
            className="px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-pink-500 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{lang === 'hy' ? 'Կրկին Մարտնչել' : 'Сразиться снова'}</span>
          </button>
        </div>
      )}

      {/* Lost Screen */}
      {gameState === 'lost' && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-rose-600 text-white rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl">
            💔
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              {lang === 'hy' ? 'Կյանքերն Ավարտվեցին 🥀' : 'Жизни закончились 🥀'}
            </h3>
            <p className="text-sm text-pink-200">
              {lang === 'hy' ? 'Կրկնիր տեսությունը և փորձիր նորից:' : 'Повтори теорию и попробуй снова!'}
            </p>
          </div>

          <button
            id="restart-lost-boss-btn"
            onClick={restartBoss}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{lang === 'hy' ? 'Փորձել Նորից' : 'Попробовать снова'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
