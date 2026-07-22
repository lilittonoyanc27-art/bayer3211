import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Trophy, Volume2, Layers } from 'lucide-react';
import { Language, UserStats } from './types';
import { WORD_PAIRS, ALL_DICTIONARY_WORDS } from './theoryData';
import { soundFx, speakSpanish } from './audioUtils';
import confetti from 'canvas-confetti';

interface GameTransformerProps {
  lang: Language;
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

interface MemoryCard {
  id: string;
  pairId: string;
  type: 'spanish' | 'translation';
  text: string;
  gender?: 'el' | 'la';
  isFlipped: boolean;
  isMatched: boolean;
}

export const GameTransformer: React.FC<GameTransformerProps> = ({ lang, stats, onUpdateStats }) => {
  const [activeMode, setActiveMode] = useState<'pairs' | 'memory'>('pairs');

  // Pair Matching State
  const [selectedMasculine, setSelectedMasculine] = useState<string | null>(null);
  const [selectedFeminine, setSelectedFeminine] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);

  // Memory Grid State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);

  // Initialize Memory Game
  const initMemoryGame = () => {
    soundFx.playClick();
    const sample = [...ALL_DICTIONARY_WORDS].slice(0, 6);
    const cards: MemoryCard[] = [];

    sample.forEach((item) => {
      cards.push({
        id: `${item.id}-sp`,
        pairId: item.id,
        type: 'spanish',
        text: `${item.gender} ${item.word}`,
        gender: item.gender,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        id: `${item.id}-tr`,
        pairId: item.id,
        type: 'translation',
        text: lang === 'hy' ? item.translationHy : item.translationRu,
        gender: item.gender,
        isFlipped: false,
        isMatched: false,
      });
    });

    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMemoryScore(0);
  };

  useEffect(() => {
    if (activeMode === 'memory') {
      initMemoryGame();
    }
  }, [activeMode, lang]);

  // Pair mode click handlers
  const handleMasculineClick = (id: string, text: string) => {
    soundFx.playClick();
    speakSpanish(text);
    setSelectedMasculine(id);
    if (selectedFeminine) {
      checkPairMatch(id, selectedFeminine);
    }
  };

  const handleFeminineClick = (id: string, text: string) => {
    soundFx.playClick();
    speakSpanish(text);
    setSelectedFeminine(id);
    if (selectedMasculine) {
      checkPairMatch(selectedMasculine, id);
    }
  };

  const checkPairMatch = (mascId: string, femId: string) => {
    if (mascId === femId) {
      soundFx.playSuccess();
      const updated = [...matchedPairIds, mascId];
      setMatchedPairIds(updated);
      setSelectedMasculine(null);
      setSelectedFeminine(null);

      if (updated.length === WORD_PAIRS.length) {
        confetti({ particleCount: 90, spread: 70 });
        soundFx.playFanfare();
        onUpdateStats({
          transformerScore: Math.max(stats.transformerScore, 100),
          totalXP: stats.totalXP + 50,
        });
      }
    } else {
      soundFx.playError();
      setTimeout(() => {
        setSelectedMasculine(null);
        setSelectedFeminine(null);
      }, 500);
    }
  };

  // Memory card click
  const handleMemoryCardClick = (index: number) => {
    if (flippedCards.length === 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) return;

    soundFx.playClick();
    const newCards = [...memoryCards];
    newCards[index].isFlipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newCards[index].type === 'spanish') {
      speakSpanish(newCards[index].text);
    }

    if (newFlipped.length === 2) {
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];

      if (newCards[idx1].pairId === newCards[idx2].pairId) {
        soundFx.playSuccess();
        setTimeout(() => {
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setMemoryCards([...newCards]);
          setFlippedCards([]);
          setMemoryScore((prev) => prev + 20);

          if (newCards.every((c) => c.isMatched)) {
            confetti({ particleCount: 100, spread: 80 });
            soundFx.playFanfare();
            onUpdateStats({ totalXP: stats.totalXP + 60 });
          }
        }, 500);
      } else {
        soundFx.playError();
        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setMemoryCards([...newCards]);
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Game Header & Mode Switch */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-pink-500 via-orange-500 to-amber-400 rounded-2xl text-slate-950 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">
              {lang === 'hy' ? '3. Գոյականների Զույգեր & Մեմորի' : '3. Пары суффиксов и Мемори'}
            </h2>
            <p className="text-xs text-rose-200">
              {lang === 'hy'
                ? 'Զուգակցիր արական և իգական ձևերը կամ բացիր մեմորի քարտերը:'
                : 'Соединяй мужские и женские формы или открывай карточки памяти.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl border border-white/15 text-xs font-bold">
          <button
            id="mode-pairs-btn"
            onClick={() => setActiveMode('pairs')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'pairs' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-100 hover:text-white'
            }`}
          >
            {lang === 'hy' ? '♂-♀ Զույգեր' : '♂-♀ Пары'}
          </button>
          <button
            id="mode-memory-btn"
            onClick={() => setActiveMode('memory')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'memory' ? 'bg-orange-500 text-white shadow-md' : 'text-orange-100 hover:text-white'
            }`}
          >
            {lang === 'hy' ? '🃏 Մեմորի Քարտեր' : '🃏 Мемори карточки'}
          </button>
        </div>
      </div>

      {/* Mode 1: Pair Matching */}
      {activeMode === 'pairs' && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/15 space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">
              {lang === 'hy' ? 'Միացրու Արական և Իգական Զույգերը' : 'Соедини Мужские и Женские пары'}
            </h3>
            <p className="text-xs text-pink-200">
              {lang === 'hy' ? 'Ընտրիր մեկ բառ ձախից (♂) և դրան համապատասխանողը աջից (♀):' : 'Выбери слово слева (♂) и подходящее справа (♀).'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Masculine Column */}
            <div className="space-y-3">
              <span className="text-xs font-black text-blue-300 block text-center uppercase tracking-wider">
                ♂ Masculino (Արական)
              </span>
              {WORD_PAIRS.map((pair) => {
                const isMatched = matchedPairIds.includes(pair.id);
                const isSelected = selectedMasculine === pair.id;
                return (
                  <button
                    key={pair.id}
                    disabled={isMatched}
                    onClick={() => handleMasculineClick(pair.id, pair.masculine)}
                    className={`w-full p-4 rounded-2xl text-sm font-bold border text-left transition-all flex items-center justify-between ${
                      isMatched
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 opacity-60'
                        : isSelected
                        ? 'bg-blue-600 border-blue-300 text-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{pair.masculine}</span>
                    <Volume2 className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>

            {/* Feminine Column */}
            <div className="space-y-3">
              <span className="text-xs font-black text-pink-300 block text-center uppercase tracking-wider">
                ♀ Femenino (Իգական)
              </span>
              {[...WORD_PAIRS].reverse().map((pair) => {
                const isMatched = matchedPairIds.includes(pair.id);
                const isSelected = selectedFeminine === pair.id;
                return (
                  <button
                    key={pair.id}
                    disabled={isMatched}
                    onClick={() => handleFeminineClick(pair.id, pair.feminine)}
                    className={`w-full p-4 rounded-2xl text-sm font-bold border text-left transition-all flex items-center justify-between ${
                      isMatched
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 opacity-60'
                        : isSelected
                        ? 'bg-pink-600 border-pink-300 text-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{pair.feminine}</span>
                    <Volume2 className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>

          {matchedPairIds.length === WORD_PAIRS.length && (
            <div className="text-center p-6 bg-emerald-950/50 border border-emerald-500/40 rounded-3xl space-y-3 animate-fadeIn">
              <h4 className="text-xl font-black text-emerald-200">
                {lang === 'hy' ? 'Բոլոր Զույգերը Համադրված են! 🎉' : 'Все пары сопоставлены! 🎉'}
              </h4>
              <button
                onClick={() => setMatchedPairIds([])}
                className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:scale-105 transition-all"
              >
                {lang === 'hy' ? 'Կրկին Խաղալ' : 'Сыграть снова'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Memory Flip Grid */}
      {activeMode === 'memory' && (
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/15 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'hy' ? 'Մեմորի Ցանց՝ Իսպաներեն & Թարգմանություն' : 'Мемори карточки: Испанский и Перевод'}
              </h3>
              <p className="text-xs text-pink-200">
                {lang === 'hy' ? 'Գտիր նույն իմաստն ունեցող զույգ քարտերը:' : 'Найди пару с одинаковым значением.'}
              </p>
            </div>

            <button
              onClick={initMemoryGame}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Վերասկսել"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {memoryCards.map((card, index) => {
              const isRevealed = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  disabled={card.isMatched}
                  onClick={() => handleMemoryCardClick(index)}
                  className={`h-28 rounded-2xl p-3 font-black text-xs md:text-sm border transition-all duration-300 flex items-center justify-center text-center shadow-lg ${
                    card.isMatched
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 opacity-60'
                      : isRevealed
                      ? card.gender === 'el'
                        ? 'bg-blue-600 border-blue-300 text-white'
                        : 'bg-pink-600 border-pink-300 text-white'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-pink-200'
                  }`}
                >
                  {isRevealed ? (
                    <span>{card.text}</span>
                  ) : (
                    <span className="text-2xl font-black text-amber-300 opacity-60">?</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
