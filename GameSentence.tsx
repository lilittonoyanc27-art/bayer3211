import React, { useState } from 'react';
import { BookOpen, CheckCircle2, XCircle, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { Language, UserStats } from './types';
import { SENTENCE_QUESTIONS } from './gameData';
import { soundFx, speakSpanish } from './audioUtils';
import confetti from 'canvas-confetti';

interface GameSentenceProps {
  lang: Language;
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const GameSentence: React.FC<GameSentenceProps> = ({ lang, stats, onUpdateStats }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedAdjective, setSelectedAdjective] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const q = SENTENCE_QUESTIONS[questionIndex];

  const handleSubmit = () => {
    if (!selectedArticle || !q) return;

    soundFx.playClick();
    setIsSubmitted(true);

    const articleCorrect = selectedArticle === q.correctArticle;
    const adjCorrect = !q.adjectiveQuestion || selectedAdjective === q.adjectiveQuestion.correctAdjective;

    if (articleCorrect && adjCorrect) {
      soundFx.playSuccess();
      setScore((prev) => prev + 30);
      speakSpanish(q.fullSpanishSentence);
    } else {
      soundFx.playError();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    setSelectedArticle(null);
    setSelectedAdjective(null);
    setIsSubmitted(false);

    if (questionIndex + 1 < SENTENCE_QUESTIONS.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 80 });
      soundFx.playFanfare();
      onUpdateStats({
        sentenceScore: Math.max(stats.sentenceScore, score + 30),
        totalXP: stats.totalXP + score + 30,
      });
    }
  };

  const restartGame = () => {
    soundFx.playClick();
    setQuestionIndex(0);
    setSelectedArticle(null);
    setSelectedAdjective(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-amber-400 to-orange-600 rounded-2xl text-slate-950 shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">
              {lang === 'hy' ? '4. Նախադասությունների Կառուցում' : '4. Контекст и Предложения'}
            </h2>
            <p className="text-xs text-rose-200">
              {lang === 'hy'
                ? 'Լրացրու ճիշտ հոդը և ածականի համաձայնեցումը նախադասության մեջ:'
                : 'Вставь правильный артикль и согласуй прилагательное в предложении.'}
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
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-pink-200 font-bold">
            <span>
              {lang === 'hy' ? `Նախադասություն ${questionIndex + 1} / ${SENTENCE_QUESTIONS.length}` : `Предложение ${questionIndex + 1} из ${SENTENCE_QUESTIONS.length}`}
            </span>
            <button
              onClick={() => speakSpanish(q.fullSpanishSentence)}
              className="flex items-center space-x-1 text-yellow-300 hover:text-white transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === 'hy' ? 'Լսել' : 'Слушать'}</span>
            </button>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / SENTENCE_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Sentence Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-white leading-snug">
              {q.sentenceWithBlank.replace('___', selectedArticle ? `[${selectedArticle}]` : '______')}
            </h3>

            <p className="text-sm text-pink-200 italic">
              "{lang === 'hy' ? q.sentenceHy : q.sentenceRu}"
            </p>
          </div>

          {/* Article Choice */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-pink-200 uppercase tracking-wider block">
              {lang === 'hy' ? 'Ընտրիր հոդը (Artículo):' : 'Выбери артикль (Artículo):'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  disabled={isSubmitted}
                  onClick={() => setSelectedArticle(opt)}
                  className={`py-3 px-4 rounded-2xl font-black text-lg border transition-all ${
                    selectedArticle === opt
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Adjective Choice */}
          {q.adjectiveQuestion && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-pink-200 uppercase tracking-wider block">
                {lang === 'hy' ? 'Ընտրիր ածականի ճիշտ սեռական ձևը:' : 'Выбери правильную форму прилагательного:'}
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {q.adjectiveQuestion.options.map((adj) => (
                  <button
                    key={adj}
                    disabled={isSubmitted}
                    onClick={() => setSelectedAdjective(adj)}
                    className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                      selectedAdjective === adj
                        ? 'bg-pink-600 text-white border-pink-300 shadow-lg scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                    }`}
                  >
                    {adj}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit / Feedback */}
          {!isSubmitted ? (
            <button
              id="sentence-submit-btn"
              disabled={!selectedArticle || (!!q.adjectiveQuestion && !selectedAdjective)}
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-xl transition-all"
            >
              {lang === 'hy' ? 'Ստուգել Նախադասությունը' : 'Проверить предложение'}
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              <div
                className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  selectedArticle === q.correctArticle &&
                  (!q.adjectiveQuestion || selectedAdjective === q.adjectiveQuestion.correctAdjective)
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                {selectedArticle === q.correctArticle ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-bold block text-sm">
                    {lang === 'hy' ? q.explanationHy : q.explanationRu}
                  </span>
                </div>
              </div>

              <button
                id="sentence-next-btn"
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === 'hy' ? 'Հաջորդ Նախադասությունը ➔' : 'Следующее предложение ➔'}
              </button>
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-amber-400 text-slate-950 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
            <BookOpen className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">
              {lang === 'hy' ? 'Գերազանց Կատարում! 📖' : 'Превосходное исполнение! 📖'}
            </h3>
            <p className="text-sm text-pink-200">
              {lang === 'hy' ? 'Դուք յուրացրեցիք հոդերի և ածականների համաձայնեցումը:' : 'Вы освоили согласование артиклей и прилагательных!'}
            </p>
          </div>

          <button
            id="restart-sentence-btn"
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
