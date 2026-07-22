import React, { useState } from 'react';
import { Search, Volume2, Sparkles, AlertCircle, BookOpen, Layers, Filter } from 'lucide-react';
import { Language } from './types';
import { THEORY_SECTIONS, ALL_DICTIONARY_WORDS, WORD_PAIRS } from './theoryData';
import { speakSpanish, soundFx } from './audioUtils';

interface TheoryViewProps {
  lang: Language;
  onStartGame: (gameId: string) => void;
}

export const TheoryView: React.FC<TheoryViewProps> = ({ lang, onStartGame }) => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGender, setFilterGender] = useState<'all' | 'el' | 'la'>('all');

  const filteredWords = ALL_DICTIONARY_WORDS.filter((word) => {
    const matchesQuery =
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translationHy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translationRu.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'all' || word.gender === filterGender;
    return matchesQuery && matchesGender;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-rose-900/60 via-orange-900/50 to-red-900/60 backdrop-blur-md p-6 rounded-3xl border border-pink-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-pink-500/30 border border-pink-400/30 rounded-full text-xs font-bold text-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{lang === 'hy' ? 'Քերականության Ուղեցույց' : 'Грамматический справочник'}</span>
            </div>
            <h2 id="theory-heading" className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-orange-100 to-white">
              {lang === 'hy'
                ? 'Իսպաներենի Գոյականների Սեռերը (Masculino y Femenino)'
                : 'Род существительных в испанском языке (Masculino y Femenino)'}
            </h2>
            <p className="text-sm text-pink-100/90 leading-relaxed">
              {lang === 'hy'
                ? 'Իմացեք բոլոր կանոնները, վերջավորությունները (-o, -a, -ción, -dad) և խաբուսիկ բացառությունները (el problema, la mano, el agua): Լսեք արտասանությունը և խաղացեք 5 ինտերակտիվ խաղ:'
                : 'Изучите все правила, окончания (-o, -a, -ción, -dad) и обманчивые исключения (el problema, la mano, el agua). Слушайте произношение и закрепите знания в 5 играх.'}
            </p>
          </div>

          <button
            id="start-first-game-btn"
            onClick={() => {
              soundFx.playClick();
              onStartGame('game_sorting');
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-300 hover:to-pink-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 shrink-0"
          >
            <span>{lang === 'hy' ? 'Սկսել Խաղալ 🎮' : 'Начать игру 🎮'}</span>
          </button>
        </div>
      </div>

      {/* Rules Overview Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <span>{lang === 'hy' ? 'Քերականության 4 Կարևոր Կանոնները' : '4 Главных правила грамматики'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {THEORY_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 transition-all duration-300 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-gradient-to-r from-pink-500/30 to-orange-500/30 border border-pink-400/30 rounded-xl text-xs font-black text-amber-200">
                  {section.badge}
                </span>
                <span className="text-xs text-rose-300 font-medium">es-ES</span>
              </div>

              <div>
                <h4 className="text-lg font-black text-yellow-100">
                  {lang === 'hy' ? section.titleHy : section.titleRu}
                </h4>
                <p className="text-xs text-pink-200/80 mt-1">
                  {lang === 'hy' ? section.summaryHy : section.summaryRu}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {section.rules.map((rule, idx) => (
                  <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                    <h5 className="text-sm font-bold text-pink-300 flex items-center space-x-1.5">
                      <span>{lang === 'hy' ? rule.ruleTitleHy : rule.ruleTitleRu}</span>
                    </h5>
                    <p className="text-xs text-slate-200/90 leading-relaxed">
                      {lang === 'hy' ? rule.explanationHy : rule.explanationRu}
                    </p>

                    {/* Word Chips */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {rule.examples.map((ex, exIdx) => (
                        <button
                          key={exIdx}
                          id={`example-word-${ex.spanish}`}
                          onClick={() => {
                            soundFx.playClick();
                            speakSpanish(`${ex.article} ${ex.spanish}`);
                          }}
                          className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
                            ex.article === 'el'
                              ? 'bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/40 text-blue-100'
                              : 'bg-pink-500/20 hover:bg-pink-500/40 border-pink-400/40 text-pink-100'
                          }`}
                        >
                          <span className="opacity-80 font-mono uppercase">{ex.article}</span>
                          <span className="underline decoration-dotted">{ex.spanish}</span>
                          <span className="opacity-75 text-[11px]">
                            ({lang === 'hy' ? ex.translationHy : ex.translationRu})
                          </span>
                          <Volume2 className="w-3 h-3 text-white/70 group-hover:text-yellow-300 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Masculine & Feminine Pairs Table */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-yellow-300" />
          <h3 className="text-lg font-bold text-white">
            {lang === 'hy' ? 'Արական և Իգական Զույգեր (Պարտադիր Հիշել)' : 'Пары мужского и женского рода (Обязательно к запоминанию)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {WORD_PAIRS.map((pair) => (
            <div
              key={pair.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                {/* Masculine side */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    speakSpanish(pair.masculine);
                  }}
                  className="flex items-center space-x-1 text-blue-300 font-black hover:text-blue-100 transition-colors"
                >
                  <span className="text-base">♂</span>
                  <span>{pair.masculine}</span>
                  <Volume2 className="w-3 h-3 opacity-60" />
                </button>

                <span className="text-pink-400 font-extrabold text-sm">➔</span>

                {/* Feminine side */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    speakSpanish(pair.feminine);
                  }}
                  className="flex items-center space-x-1 text-pink-300 font-black hover:text-pink-100 transition-colors"
                >
                  <span className="text-base">♀</span>
                  <span>{pair.feminine}</span>
                  <Volume2 className="w-3 h-3 opacity-60" />
                </button>
              </div>

              <div className="text-[11px] text-slate-300/80 pt-1 border-t border-white/5 flex justify-between">
                <span>{lang === 'hy' ? pair.masculineMeaningHy : pair.masculineMeaningRu}</span>
                <span className="text-pink-300">{lang === 'hy' ? pair.feminineMeaningHy : pair.feminineMeaningRu}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Searchable Word Bank Dictionary */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-pink-300" />
              <span>{lang === 'hy' ? 'Բառարան և Արտասանություն' : 'Словарь и Произношение'}</span>
            </h3>
            <p className="text-xs text-pink-200/80">
              {lang === 'hy'
                ? 'Սեղմեք ցանկացած բառի վրա իսպաներեն արտասանությունը լսելու համար:'
                : 'Нажмите на любое слово, чтобы услышать его произношение на испанском.'}
            </p>
          </div>

          {/* Search bar & filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-3" />
              <input
                id="dictionary-search-input"
                type="text"
                placeholder={lang === 'hy' ? 'Փնտրել բառ կամ թարգմանություն...' : 'Поиск слова или перевода...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
              />
            </div>

            <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-xl border border-white/15 text-xs">
              <Filter className="w-3.5 h-3.5 text-pink-300 ml-1.5" />
              <button
                id="filter-all-btn"
                onClick={() => setFilterGender('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterGender === 'all' ? 'bg-pink-500 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {lang === 'hy' ? 'Բոլորը' : 'Все'}
              </button>
              <button
                id="filter-el-btn"
                onClick={() => setFilterGender('el')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterGender === 'el' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'
                }`}
              >
                El ♂
              </button>
              <button
                id="filter-la-btn"
                onClick={() => setFilterGender('la')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterGender === 'la' ? 'bg-pink-600 text-white' : 'text-pink-300 hover:text-white'
                }`}
              >
                La ♀
              </button>
            </div>
          </div>
        </div>

        {/* Dictionary Word Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                item.gender === 'el'
                  ? 'bg-blue-950/30 border-blue-500/30 hover:border-blue-400/60'
                  : 'bg-pink-950/30 border-pink-500/30 hover:border-pink-400/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide ${
                        item.gender === 'el' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
                      }`}
                    >
                      {item.gender}
                    </span>
                    <span className="text-lg font-black text-white">{item.word}</span>
                  </div>
                  <p className="text-xs text-amber-200/90 font-medium mt-1">
                    {lang === 'hy' ? item.translationHy : item.translationRu}
                  </p>
                </div>

                <button
                  id={`speak-word-${item.word}`}
                  onClick={() => {
                    soundFx.playClick();
                    speakSpanish(`${item.gender} ${item.word}`);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-yellow-300 transition-colors"
                  title="Արտասանել / Произнести"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-pink-100/70 bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                <div className="font-semibold text-amber-300/90">
                  {lang === 'hy' ? item.ruleExplanationHy : item.ruleExplanationRu}
                </div>
                <div className="text-slate-300 italic">
                  "{item.exampleSentence}" ({lang === 'hy' ? item.sentenceTranslationHy : item.sentenceTranslationRu})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
