import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, CheckCircle2, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { Language, UserStats } from './types';
import { DETECTIVE_QUESTIONS } from './gameData';
import { soundFx, speakSpanish } from './audioUtils';
import confetti from 'canvas-confetti';

interface GameDetectiveProps {
  lang: Language;
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const GameDetective: React.FC<GameDetectiveProps> = ({ lang, stats, onUpdateStats }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const q = DETECTIVE_QUESTIONS[questionIndex];

  const handleSubmit = () => {
    if (!selectedArticle || selectedReason === null || !q) return;

    soundFx.playClick();
    setIsSubmitted(true);

    const articleCorrect = selectedArticle === q.correctArticle;
    const reasonCorrect = selectedReason === q.correctReasonIndex;

    if (articleCorrect && reasonCorrect) {
      soundFx.playSuccess();
      setScore((prev) => prev + 25);
      speakSpanish(`${q.correctArticle} ${q.word}`);
    } else {
      soundFx.playError();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    setSelectedArticle(null);
    setSelectedReason(null);
    setShowHint(false);
    setIsSubmitted(false);

    if (questionIndex + 1 < DETECTIVE_QUESTIONS.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 80 });
      soundFx.playFanfare();
      onUpdateStats({
        detectiveScore: Math.max(stats.detectiveScore, score + 25),
        totalXP: stats.totalXP + score + 25,
      });
    }
  };

  const restartGame = () => {
    soundFx.playClick();
    setQuestionIndex(0);
    setSelectedArticle(null);
    setSelectedReason(null);
    setShowHint(false);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">
              {lang === 'hy' ? '2. Բացառությունների Դետեկտիվ' : '2. Детектив исключений'}
            </h2>
            <p className="text-xs text-rose-200">
              {lang === 'hy'
                ? 'Գտիր խաբուսիկ բառերի ճիշտ հոդը և քերականական պատճառը:'
                : 'Найди правильный артикль и грамматическую причину исключения.'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-pink-200 block">Միավոր</span>
          <span className="text-xl font-black text-amber-300">{score} XP</span>
        </div>
      </div>

      {!isFinished && q && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/15 space-y-6 shadow-2xl">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-pink-200 font-bold">
            <span>
              {lang === 'hy' ? `Հարց ${questionIndex + 1} / ${DETECTIVE_QUESTIONS.length}` : `Вопрос ${questionIndex + 1} из ${DETECTIVE_QUESTIONS.length}`}
            </span>
            <span>{q.isException ? (lang === 'hy' ? '⚠️ Բացառություն' : '⚠️ Исключение') : (lang === 'hy' ? '✨ Կանոնավոր' : '✨ Регулярное')}</span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / DETECTIVE_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Clue Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <span className="text-xs text-amber-300 uppercase tracking-widest font-bold">
              {lang === 'hy' ? 'Հետաքննվող Բառը' : 'Исследуемое слово'}
            </span>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              ___ {q.word}
            </h3>
            <button
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-xl text-xs font-bold transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{lang === 'hy' ? 'Հուշում' : 'Подсказка'}</span>
            </button>

            {showHint && (
              <p className="text-xs text-amber-200/90 bg-black/40 p-3 rounded-xl border border-yellow-500/30 animate-fadeIn">
                {lang === 'hy' ? q.hintHy : q.hintRu}
              </p>
            )}
          </div>

          {/* Step 1: Article selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">
              1. {lang === 'hy' ? 'Ընտրիր ճիշտ հոդը (Artículo):' : 'Выбери правильный артикль (Artículo):'}
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {q.optionsArticles.map((art) => (
                <button
                  key={art}
                  disabled={isSubmitted}
                  onClick={() => setSelectedArticle(art)}
                  className={`py-3.5 px-6 rounded-2xl font-black text-xl border transition-all ${
                    selectedArticle === art
                      ? 'bg-pink-600 text-white border-pink-300 shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                  }`}
                >
                  {art}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Reason selection */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold text-white block">
              2. {lang === 'hy' ? 'Ինչո՞ւ է այս հոդը դրվում (Քերականական պատճառ):' : 'Почему используется этот артикль (Причина)?'}
            </label>
            <div className="space-y-2">
              {(lang === 'hy' ? q.optionsReasonsHy : q.optionsReasonsRu).map((reasonText, idx) => (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => setSelectedReason(idx)}
                  className={`w-full text-left p-4 rounded-2xl text-xs font-semibold border transition-all ${
                    selectedReason === idx
                      ? 'bg-gradient-to-r from-orange-500/40 to-pink-500/40 border-pink-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-pink-100 hover:bg-white/10'
                  }`}
                >
                  {reasonText}
                </button>
              ))}
            </div>
          </div>

          {/* Submit / Feedback */}
          {!isSubmitted ? (
            <button
              id="detective-submit-btn"
              disabled={!selectedArticle || selectedReason === null}
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-pink-500 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-xl transition-all"
            >
              {lang === 'hy' ? 'Ստուգել Պատասխանը' : 'Проверить ответ'}
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              <div
                className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  selectedArticle === q.correctArticle && selectedReason === q.correctReasonIndex
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                {selectedArticle === q.correctArticle && selectedReason === q.correctReasonIndex ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-bold block">
                    {selectedArticle === q.correctArticle && selectedReason === q.correctReasonIndex
                      ? (lang === 'hy' ? 'Ճիշտ է! Գերազանց դետեկտիվ:' : 'Правильно! Отличная детективная работа!')
                      : (lang === 'hy' ? 'Սխալ է:' : 'Неправильно:')}
                  </span>
                  <span>
                    {lang === 'hy'
                      ? `Ճիշտ հոդն է՝ «${q.correctArticle} ${q.word}».`
                      : `Правильный артикль: «${q.correctArticle} ${q.word}».`}
                  </span>
                </div>
              </div>

              <button
                id="detective-next-btn"
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === 'hy' ? 'Հաջորդ Բառը ➔' : 'Следующее слово ➔'}
              </button>
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-pink-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">
              {lang === 'hy' ? 'Դետեկտիվի Առաքելությունն Ավարտված է! 🕵️' : 'Миссия детектива завершена! 🕵️'}
            </h3>
            <p className="text-sm text-pink-200">
              {lang === 'hy' ? 'Դուք բացահայտեցիք իսպաներենի բոլոր գաղտնի բացառությունները:' : 'Вы раскрыли все секретные исключения испанского языка!'}
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 max-w-xs mx-auto">
            <span className="text-xs text-pink-200 block">{lang === 'hy' ? 'Վաստակած XP' : 'Заработано XP'}</span>
            <span className="text-3xl font-black text-amber-300">+{score} XP</span>
          </div>

          <button
            id="restart-detective-btn"
            onClick={restartGame}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{lang === 'hy' ? 'Կրկնել' : 'Повторить'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
