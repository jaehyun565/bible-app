import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, BookOpen, Search, CheckCircle2, RefreshCw, Bookmark, List, LayoutGrid } from 'lucide-react';
import versesData from './data/verses.json';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 브라우저 저장소에서 데이터 가져오기
const savedStep = Number(localStorage.getItem('honey-bible-step')) || 1;
const savedLastId = Number(localStorage.getItem('honey-bible-last-id')) || null;

const App = () => {
  const [step, setStep] = useState(savedStep);
  const [mode, setMode] = useState('view');
  const [viewType, setViewType] = useState('card'); // 'card' 또는 'list' (보기 모드 전용)
  const [practiceScope, setPracticeScope] = useState('current');  
  const [isHoldingAnswer, setIsHoldingAnswer] = useState(false);    

  // currentIndex 초기값 설정 (새로고침 시 책갈피 위치로 바로 시작)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const initialVerses = versesData.filter(v => {
      const steps = Array.isArray(v.step) ? v.step : [v.step];
      return steps.includes(savedStep);
    }).sort((a, b) => a.id - b.id);
    if (savedLastId) {
      const idx = initialVerses.findIndex(v => v.id === savedLastId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  const displayVerses = useMemo(() => {
    let filtered = [];
    if (mode === 'view') {
      filtered = versesData.filter(v => {
        const steps = Array.isArray(v.step) ? v.step : [v.step];
        return steps.includes(step);
      }).sort((a, b) => a.id - b.id);
    } else {
      if (practiceScope === 'current') {
        filtered = versesData.filter(v => {
          const steps = Array.isArray(v.step) ? v.step : [v.step];
          return steps.includes(step);
        });
      } else {
        filtered = versesData.filter(v => {
          const steps = Array.isArray(v.step) ? v.step : [v.step];
          return steps.some(s => s >= 1 && s <= step);
        });
      }
      filtered = shuffleArray(filtered);
    }
    return filtered;
  }, [mode, step, practiceScope]);

  const handleStepChange = (s) => {
    setStep(s);
    setCurrentIndex(0);
    setIsHoldingAnswer(false);
  };

  const handleModeChange = (m) => {
    setMode(m);
    setCurrentIndex(0);
    setIsHoldingAnswer(false);
  };

  const handleScopeChange = (scope) => {
    setPracticeScope(scope);
    setCurrentIndex(0);
    setIsHoldingAnswer(false);
  };

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

  const shuffleCurrent = () => {    
    handleModeChange(mode); 
  };

  useEffect(() => {
    if (displayVerses[currentIndex] && mode === 'view' && viewType === 'card') {
      localStorage.setItem('honey-bible-step', step);
      localStorage.setItem('honey-bible-last-id', displayVerses[currentIndex].id);
    }
  }, [currentIndex, step, displayVerses, mode, viewType]);

  return (
    <div className="max-w-md mx-auto h-[100dvh] flex flex-col p-3 font-sans bg-[#FFFDF0] text-[#451A03] select-none overflow-hidden">
      
      {/* 헤더: 북마크 안내 문구 제거함 */}
      <header className="py-2 text-center flex flex-col items-center relative flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-2xl">🍯</span>
          <h1 className="text-xl font-black text-[#854D0E] tracking-tight">꿀송이 말씀 암송 대회</h1>
        </div>
      </header>

      {/* 단계 선택 (1-7단계) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar px-1 flex-shrink-0">
        {[1, 2, 3, 4, 5, 6, 7].map(s => (
          <button 
            key={s}
            onClick={() => handleStepChange(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              step === s ? 'bg-[#F59E0B] text-white shadow-md scale-105' : 'bg-white text-[#B45309] border border-[#FEF3C7]'
            }`}
          >
            {s}단계
          </button>
        ))}
      </div>

      {/* 모드 선택 */}
      <div className="flex bg-[#FEF3C7]/50 rounded-xl shadow-sm p-1 mb-2 border border-[#FDE68A] flex-shrink-0">
        {[
          { id: 'view', label: '보기', icon: <Eye size={16}/> },
          { id: 'memorize', label: '암송', icon: <BookOpen size={16}/> },
          { id: 'referenceMatch', label: '구절맞추기', icon: <Search size={16}/> }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === m.id ? 'bg-[#451A03] text-white shadow-md' : 'text-[#92400E]'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* 보기 형식 선택 스위치 및 범위 선택 */}
      <div className="h-9 mb-3 flex-shrink-0">
        {mode === 'view' ? (
          <div className="flex justify-end gap-2 px-1">
            <button 
              onClick={() => setViewType('card')}
              className={`p-2 rounded-lg transition-all ${viewType === 'card' ? 'bg-[#F59E0B] text-white shadow-sm' : 'bg-[#FEF3C7] text-[#D97706]'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#F59E0B] text-white shadow-sm' : 'bg-[#FEF3C7] text-[#D97706]'}`}
            >
              <List size={18} />
            </button>
          </div>
        ) : (
          <div className="flex bg-[#FEF3C7]/60 rounded-lg p-0.5">
            <button onClick={() => handleScopeChange('current')} className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${practiceScope === 'current' ? 'bg-white text-[#D97706] shadow-sm' : 'text-[#B45309]'}`}>이 단계만</button>
            <button onClick={() => handleScopeChange('cumulative')} className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${practiceScope === 'cumulative' ? 'bg-white text-[#D97706] shadow-sm' : 'text-[#B45309]'}`}>누적단계</button>
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="relative flex-grow flex flex-col items-center justify-center min-h-0">
        {displayVerses.length > 0 ? (
          <>
            {mode === 'view' && viewType === 'list' ? (
              // --- 목록(표) 형태 ---
              <div className="w-full h-full bg-white rounded-[1.5rem] shadow-xl border border-[#FEF3C7] overflow-hidden flex flex-col">
                <div className="bg-[#F59E0B] p-3 text-white font-bold text-center flex-shrink-0">
                  {step}단계 전체 목록
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#FFFBEB] text-[#854D0E] text-xs uppercase z-10">
                      <tr>
                        <th className="p-3 border-b border-[#FEF3C7] w-24">장절</th>
                        <th className="p-3 border-b border-[#FEF3C7]">말씀 내용</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {displayVerses.map((v, idx) => (
                        <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]'}>
                          <td className="p-3 align-top font-bold text-[#D97706] border-b border-[#FEF3C7] text-xs whitespace-nowrap">
                            {v.ref}
                          </td>
                          <td className="p-3 align-top leading-relaxed text-[#451A03] border-b border-[#FEF3C7] break-keep">
                            {v.content}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // --- 카드 형태 (암송 / 구절맞추기 포함) ---
              <>
                <AnimatePresence mode="wait">
                  <Motion.div
                    key={`${mode}-${step}-${practiceScope}-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full bg-white rounded-[2rem] shadow-xl shadow-amber-200/20 p-6 flex flex-col items-center border border-[#FEF3C7] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#F59E0B]" />
                    <div className="h-12 flex items-center justify-center w-full mb-2 flex-shrink-0 text-center">
                      {mode === 'referenceMatch' ? (
                        isHoldingAnswer ? (
                          <h2 className="text-xl font-black text-[#D97706] animate-pulse">{displayVerses[currentIndex]?.ref}</h2>
                        ) : (
                          <div className="px-3 py-1 bg-[#FFFBEB] rounded-lg text-[#D97706]/40 font-bold text-xs border border-dashed border-[#FDE68A]">말씀을 떠올려보세요</div>
                        )
                      ) : (
                        <h2 className="text-xl font-black text-[#451A03]">{displayVerses[currentIndex]?.ref}</h2>
                      )}
                    </div>
                    <div className="flex-grow w-full overflow-y-auto px-2 flex flex-col items-center no-scrollbar">
                      <div className="m-auto w-full text-center py-4">
                        {mode === 'memorize' ? (
                          isHoldingAnswer ? (
                            <p className="text-[1.15rem] font-bold leading-relaxed text-[#D97706] break-keep animate-pulse">
                              {displayVerses[currentIndex]?.content}
                            </p>
                          ) : (
                            <p className="text-[#D97706]/40 italic text-sm font-medium">꿀송이보다 달콤한 말씀을 암송해보세요</p>
                          )
                        ) : (
                          <p className="text-[1.15rem] font-bold leading-relaxed text-[#451A03] break-keep">
                            {displayVerses[currentIndex]?.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {mode !== 'view' && (
                      <div className="w-full flex gap-2 mt-4 flex-shrink-0">
                        <button
                          onMouseDown={() => setIsHoldingAnswer(true)}
                          onMouseUp={() => setIsHoldingAnswer(false)}
                          onMouseLeave={() => setIsHoldingAnswer(false)}
                          onTouchStart={(e) => { e.preventDefault(); setIsHoldingAnswer(true); }}
                          onTouchEnd={() => setIsHoldingAnswer(false)}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                            isHoldingAnswer ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-inner' : 'bg-white border-[#F59E0B] text-[#D97706] active:bg-[#FFFBEB]'
                          }`}
                        >정답 보기</button>
                        <button onClick={nextVerse} className="flex-[0.7] py-3 bg-[#451A03] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95"><CheckCircle2 size={16} /> 암송완료</button>
                      </div>
                    )}
                  </Motion.div>
                </AnimatePresence>
                
                {/* 하단 인덱스 표시 */}
                <div className="mt-3 flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1 bg-[#FEF3C7] rounded-full text-[9px] font-black text-[#92400E] tracking-wider">
                    {currentIndex + 1} / {displayVerses.length}
                  </div>
                  {mode !== 'view' && (
                    <button onClick={shuffleCurrent} className="p-1 text-[#D97706]"><RefreshCw size={12} /></button>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-[#D97706]/50 text-sm font-bold italic">말씀 꿀송이가 준비 중입니다.</div>
        )}
      </div>

      {/* 카드형 보기 모드 전용 네비게이션 */}
      {mode === 'view' && viewType === 'card' && (
        <div className="flex gap-2 mt-3 mb-2 flex-shrink-0">
          <button onClick={prevVerse} className="p-3 bg-white rounded-2xl shadow-sm text-[#D97706] border border-[#FEF3C7] active:bg-[#FFFBEB]"><ChevronLeft size={24} strokeWidth={3} /></button>
          <button onClick={nextVerse} className="flex-grow py-3 bg-[#F59E0B] rounded-2xl shadow-md text-white font-bold text-lg flex items-center justify-center gap-1 active:scale-95">다음 말씀 <ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default App;