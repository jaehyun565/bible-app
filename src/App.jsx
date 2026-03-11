import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, BookOpen, Search, CheckCircle2, RefreshCw } from 'lucide-react';
import versesData from './data/verses.json';

// 배열을 랜덤하게 섞는 유틸리티 함수 (Fisher-Yates Shuffle)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const App = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('view'); // 'view', 'memorize', 'referenceMatch'
  const [practiceScope, setPracticeScope] = useState('current'); // 'current', 'cumulative'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoldingAnswer, setIsHoldingAnswer] = useState(false);
  
  // 실제로 화면에 보여줄 필터링된/섞인 말씀 리스트
  const [displayVerses, setDisplayVerses] = useState([]);

  // 1. 모드, 단계, 범위가 바뀔 때마다 데이터를 새로 준비
  useEffect(() => {
    let filtered = [];

    if (mode === 'view') {
      // 보기 모드: 무조건 해당 단계만, 순서대로(id순)
      filtered = versesData.filter(v => v.step === step).sort((a, b) => a.id - b.id);
    } else {
      // 암송 & 구절맞추기 모드: 범위에 따라 필터링 후 랜덤 섞기
      if (practiceScope === 'current') {
        filtered = versesData.filter(v => v.step === step);
      } else {
        filtered = versesData.filter(v => v.step >= 1 && v.step <= step);
      }
      filtered = shuffleArray(filtered); // 랜덤 섞기
    }

    setDisplayVerses(filtered);
    setCurrentIndex(0);
    setIsHoldingAnswer(false);
  }, [mode, step, practiceScope]);

  const nextVerse = () => {
    if (displayVerses.length === 0) return;
    // 마지막 구절이면 다시 섞을지 혹은 처음으로 갈지 결정 (여기서는 순환)
    setCurrentIndex((prev) => (prev + 1) % displayVerses.length);
    setIsHoldingAnswer(false);
  };

  const prevVerse = () => {
    if (displayVerses.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + displayVerses.length) % displayVerses.length);
    setIsHoldingAnswer(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 font-sans bg-slate-50 text-slate-900 select-none">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-black text-blue-900 tracking-tighter italic">꿀송이 암송대회</h1>
      </header>

      {/* 1. 단계 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4, 5].map(s => (
          <button 
            key={s}
            onClick={() => setStep(s)}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition-all ${
              step === s ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            {s}단계
          </button>
        ))}
      </div>

      {/* 2. 모드 선택 */}
      <div className="flex bg-white rounded-2xl shadow-sm p-1.5 mb-4 border border-slate-100">
        {[
          { id: 'view', label: '보기', icon: <Eye size={18}/> },
          { id: 'memorize', label: '암송', icon: <BookOpen size={18}/> },
          { id: 'referenceMatch', label: '구절맞추기', icon: <Search size={18}/> }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              mode === m.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* 3. 범위 선택 (암송/구절맞추기 모드에서만 표시) */}
      <div className="h-12 mb-6">
        <AnimatePresence>
          {mode !== 'view' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex bg-slate-200/50 rounded-xl p-1"
            >
              <button
                onClick={() => setPracticeScope('current')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  practiceScope === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                이 단계만 맞추기
              </button>
              <button
                onClick={() => setPracticeScope('cumulative')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  practiceScope === 'cumulative' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                누적단계 맞추기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. 메인 카드 영역 */}
      <div className="relative flex-grow flex flex-col items-center justify-center">
        {displayVerses.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${step}-${practiceScope}-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-white aspect-[4/5] rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-10 flex flex-col items-center border border-slate-50 relative"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                
                {/* 상단: 레퍼런스 영역 */}
                <div className="h-16 flex items-center justify-center w-full mb-6">
                  {mode === 'referenceMatch' ? (
                    isHoldingAnswer ? (
                      <h2 className="text-2xl font-black text-blue-600 tracking-tight animate-pulse text-center">
                        {displayVerses[currentIndex]?.ref}
                      </h2>
                    ) : (
                      <div className="px-4 py-2 bg-slate-50 rounded-xl text-slate-300 font-bold tracking-widest text-sm border border-dashed border-slate-200">
                        어느 말씀일까요?
                      </div>
                    )
                  ) : (
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
                      {displayVerses[currentIndex]?.ref}
                    </h2>
                  )}
                </div>
                
                {/* 중앙: 말씀 구절 영역 */}
                <div className="flex-grow flex items-center justify-center w-full text-center">
                  {mode === 'memorize' ? (
                    isHoldingAnswer ? (
                      <p className="text-xl font-medium leading-[1.7] text-blue-600 break-keep animate-pulse">
                        {displayVerses[currentIndex]?.content}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                          {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-200 rounded-full" />)}
                        </div>
                        <p className="text-slate-300 italic font-medium">말씀을 암송해 보세요</p>
                      </div>
                    )
                  ) : (
                    <p className="text-xl font-medium leading-[1.7] text-slate-800 break-keep">
                      {displayVerses[currentIndex]?.content}
                    </p>
                  )}
                </div>

                {/* 하단 버튼 (암송 & 구절맞추기) */}
                {mode !== 'view' && (
                  <div className="w-full flex gap-3 mt-6">
                    <button
                      onMouseDown={() => setIsHoldingAnswer(true)}
                      onMouseUp={() => setIsHoldingAnswer(false)}
                      onMouseLeave={() => setIsHoldingAnswer(false)}
                      onTouchStart={(e) => { e.preventDefault(); setIsHoldingAnswer(true); }}
                      onTouchEnd={() => setIsHoldingAnswer(false)}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${
                        isHoldingAnswer 
                        ? 'bg-blue-600 border-blue-600 text-white scale-95 shadow-inner' 
                        : 'bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-50'
                      }`}
                    >
                      정답 확인
                    </button>
                    <button 
                      onClick={nextVerse}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
                    >
                      <CheckCircle2 size={18} /> 완료
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-3">
              <div className="px-4 py-1.5 bg-slate-200 rounded-full text-[10px] font-black text-slate-500 tracking-[0.2em]">
                {currentIndex + 1} / {displayVerses.length}
              </div>
              {mode !== 'view' && (
                <button 
                  onClick={() => setDisplayVerses(shuffleArray(displayVerses))}
                  className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                  title="다시 섞기"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-slate-400 font-bold">해당 조건에 말씀이 없습니다.</div>
        )}
      </div>

      {/* 하단 컨트롤 (보기 모드 전용) */}
      {mode === 'view' && (
        <div className="flex gap-4 mt-8 pb-8">
          <button 
            onClick={prevVerse}
            className="p-5 bg-white rounded-3xl shadow-lg text-slate-400 active:scale-90 transition-all border border-slate-100"
          >
            <ChevronLeft size={32} strokeWidth={3} />
          </button>
          <button 
            onClick={nextVerse}
            className="flex-grow py-5 bg-slate-900 rounded-3xl shadow-xl text-white font-black text-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            다음 말씀 <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;