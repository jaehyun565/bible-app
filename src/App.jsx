import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, BookOpen, Search, CheckCircle2, RefreshCw } from 'lucide-react';
import versesData from './data/verses.json';

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
  const [mode, setMode] = useState('view');
  const [practiceScope, setPracticeScope] = useState('current');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoldingAnswer, setIsHoldingAnswer] = useState(false);
  const [displayVerses, setDisplayVerses] = useState([]);

  useEffect(() => {
    let filtered = [];
    if (mode === 'view') {
      filtered = versesData.filter(v => v.step === step).sort((a, b) => a.id - b.id);
    } else {
      filtered = practiceScope === 'current' 
        ? versesData.filter(v => v.step === step)
        : versesData.filter(v => v.step >= 1 && v.step <= step);
      filtered = shuffleArray(filtered);
    }
    setDisplayVerses(filtered);
    setCurrentIndex(0);
    setIsHoldingAnswer(false);
  }, [mode, step, practiceScope]);

  const nextVerse = () => {
    if (displayVerses.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % displayVerses.length);
    setIsHoldingAnswer(false);
  };

  const prevVerse = () => {
    if (displayVerses.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + displayVerses.length) % displayVerses.length);
    setIsHoldingAnswer(false);
  };

  return (
    // h-[100dvh]: 모바일 브라우저 주소창을 제외한 실제 높이에 맞춤
    <div className="max-w-md mx-auto h-[100dvh] flex flex-col p-3 font-sans bg-slate-50 text-slate-900 select-none overflow-hidden">
      
      {/* 1. 헤더 - 간격 대폭 축소 */}
      <header className="py-2 text-center">
        <h1 className="text-xl font-black text-blue-900 tracking-tighter italic">꿀송이 말씀 암송 대회</h1>
      </header>

      {/* 2. 단계 선택 - 패딩 축소 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {[1, 2, 3, 4, 5].map(s => (
          <button 
            key={s}
            onClick={() => setStep(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              step === s ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            {s}단계
          </button>
        ))}
      </div>

      {/* 3. 모드 선택 - 마진 축소 */}
      <div className="flex bg-white rounded-xl shadow-sm p-1 mb-2 border border-slate-100">
        {[
          { id: 'view', label: '보기', icon: <Eye size={16}/> },
          { id: 'memorize', label: '암송', icon: <BookOpen size={16}/> },
          { id: 'referenceMatch', label: '구절맞추기', icon: <Search size={16}/> }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === m.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* 4. 범위 선택 - 높이와 마진 축소 */}
      <div className="h-9 mb-3">
        {mode !== 'view' && (
          <div className="flex bg-slate-200/50 rounded-lg p-0.5">
            <button
              onClick={() => setPracticeScope('current')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                practiceScope === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              이 단계만
            </button>
            <button
              onClick={() => setPracticeScope('cumulative')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                practiceScope === 'cumulative' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              누적단계
            </button>
          </div>
        )}
      </div>

      {/* 5. 메인 카드 영역 - flex-grow로 남는 공간 차지 */}
      <div className="relative flex-grow flex flex-col items-center justify-center min-h-0">
        {displayVerses.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${step}-${practiceScope}-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full bg-white rounded-[2rem] shadow-xl shadow-blue-100/30 p-6 flex flex-col items-center border border-slate-50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
                
                {/* 레퍼런스 - 텍스트 크기 조절 */}
                <div className="h-12 flex items-center justify-center w-full mb-2">
                  {mode === 'referenceMatch' ? (
                    isHoldingAnswer ? (
                      <h2 className="text-xl font-black text-blue-600 animate-pulse">{displayVerses[currentIndex]?.ref}</h2>
                    ) : (
                      <div className="px-3 py-1 bg-slate-50 rounded-lg text-slate-300 font-bold text-xs border border-dashed border-slate-200">어느 말씀일까요?</div>
                    )
                  ) : (
                    <h2 className="text-xl font-black text-slate-900">{displayVerses[currentIndex]?.ref}</h2>
                  )}
                </div>
                
                {/* 말씀 구절 - 스크롤 가능하게 처리 (긴 말씀 대비) */}
                <div className="flex-grow flex items-center justify-center w-full text-center overflow-y-auto px-2">
                  {mode === 'memorize' ? (
                    isHoldingAnswer ? (
                      <p className="text-lg font-medium leading-relaxed text-blue-600 break-keep animate-pulse">
                        {displayVerses[currentIndex]?.content}
                      </p>
                    ) : (
                      <p className="text-slate-300 italic text-sm">말씀을 암송해 보세요</p>
                    )
                  ) : (
                    <p className="text-lg font-medium leading-relaxed text-slate-800 break-keep">
                      {displayVerses[currentIndex]?.content}
                    </p>
                  )}
                </div>

                {/* 카드 하단 버튼 - 높이 축소 */}
                {mode !== 'view' && (
                  <div className="w-full flex gap-2 mt-4">
                    <button
                      onMouseDown={() => setIsHoldingAnswer(true)}
                      onMouseUp={() => setIsHoldingAnswer(false)}
                      onMouseLeave={() => setIsHoldingAnswer(false)}
                      onTouchStart={(e) => { e.preventDefault(); setIsHoldingAnswer(true); }}
                      onTouchEnd={() => setIsHoldingAnswer(false)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        isHoldingAnswer ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-600 text-blue-600'
                      }`}
                    >
                      정답 확인
                    </button>
                    <button 
                      onClick={nextVerse}
                      className="flex-[0.7] py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={16} /> 완료
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* 인덱스 표시 - 여백 축소 */}
            <div className="mt-3 flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-200 rounded-full text-[9px] font-black text-slate-500 tracking-wider">
                {currentIndex + 1} / {displayVerses.length}
              </div>
              {mode !== 'view' && (
                <button onClick={() => setDisplayVerses(shuffleArray(displayVerses))} className="p-1 text-slate-400">
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-sm font-bold">말씀이 없습니다.</div>
        )}
      </div>

      {/* 6. 하단 네비게이션 (보기 모드) - 패딩/마진 대폭 축소 */}
      {mode === 'view' && (
        <div className="flex gap-2 mt-3 mb-2">
          <button onClick={prevVerse} className="p-3 bg-white rounded-2xl shadow-md text-slate-400 border border-slate-100">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <button onClick={nextVerse} className="flex-grow py-3 bg-slate-900 rounded-2xl shadow-lg text-white font-bold text-lg flex items-center justify-center gap-1">
            다음 <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;