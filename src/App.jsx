import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Eye, BookOpen, Search, CheckCircle2, 
  RefreshCw, List, LayoutGrid, CheckSquare, Square, Info 
} from 'lucide-react';
import versesData from './data/verses.json';

// --- 유틸리티 함수 ---
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getSaved = (key, fallback) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || fallback;
  }
  return fallback;
};

const App = () => {
  // --- 상태(State) 설정 ---
  const [step, setStep] = useState(() => Number(getSaved('honey-bible-step', 1)));
  const [mode, setMode] = useState('view');
  const [viewType, setViewType] = useState('card');
  const [practiceScope, setPracticeScope] = useState('current');
  const [excludeMemorized, setExcludeMemorized] = useState(true); // [새 기능] 암송 완료 제외 여부
  const [showAnswer, setShowAnswer] = useState(false); // [변경] 정답 보기 토글
  
  // 암송 완료된 ID 목록
  const [memorizedIds, setMemorizedIds] = useState(() => {
    const saved = getSaved('honey-bible-memorized-ids', '[]');
    try { return JSON.parse(saved); } catch { return []; }
  });

  // currentIndex 초기값
  const [currentIndex, setCurrentIndex] = useState(() => {
    const s = Number(getSaved('honey-bible-step', 1));
    const lastId = Number(getSaved('honey-bible-last-id', 0));
    const initialVerses = versesData.filter(v => {
      const steps = Array.isArray(v.step) ? v.step : [v.step];
      return steps.includes(s);
    }).sort((a, b) => a.id - b.id);
    if (lastId > 0) {
      const idx = initialVerses.findIndex(v => v.id === lastId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  // --- 데이터 필터링 로직 ---
  const displayVerses = useMemo(() => {
    let filtered = [];
    if (mode === 'view') {
      filtered = versesData.filter(v => {
        const steps = Array.isArray(v.step) ? v.step : [v.step];
        return steps.includes(step);
      }).sort((a, b) => a.id - b.id);
    } else {
      // 연습 모드 필터링
      const baseFilter = (v) => {
        if (!excludeMemorized) return true; // 전체 출제면 필터 통과
        return !memorizedIds.includes(v.id); // 제외 모드면 완료 안된 것만
      };

      if (practiceScope === 'current') {
        filtered = versesData.filter(v => {
          const steps = Array.isArray(v.step) ? v.step : [v.step];
          return steps.includes(step) && baseFilter(v);
        });
      } else {
        filtered = versesData.filter(v => {
          const steps = Array.isArray(v.step) ? v.step : [v.step];
          return steps.some(s => s >= 1 && s <= step) && baseFilter(v);
        });
      }
      filtered = shuffleArray(filtered);
    }
    return filtered;
  }, [mode, step, practiceScope, memorizedIds, excludeMemorized]);

  // --- 이벤트 핸들러 ---
  const toggleMemorized = (id) => {
    setMemorizedIds(prev => {
      const newIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('honey-bible-memorized-ids', JSON.stringify(newIds));
      return newIds;
    });
  };

  const handleStepChange = (s) => { setStep(s); setCurrentIndex(0); setShowAnswer(false); };
  const handleModeChange = (m) => { setMode(m); setCurrentIndex(0); setShowAnswer(false); };
  const handleScopeChange = (scope) => { setPracticeScope(scope); setCurrentIndex(0); setShowAnswer(false); };
  const handleExcludeToggle = (val) => { setExcludeMemorized(val); setCurrentIndex(0); setShowAnswer(false); };
  
  const nextVerse = () => { 
    if (displayVerses.length === 0) return; 
    setCurrentIndex((prev) => (prev + 1) % displayVerses.length); 
    setShowAnswer(false); 
  };
  
  const prevVerse = () => { 
    if (displayVerses.length === 0) return; 
    setCurrentIndex((prev) => (prev - 1 + displayVerses.length) % displayVerses.length); 
    setShowAnswer(false); 
  };

  const shuffleCurrent = () => { handleModeChange(mode); };

  // 로컬 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && displayVerses[currentIndex] && mode === 'view' && viewType === 'card') {
      localStorage.setItem('honey-bible-step', step.toString());
      localStorage.setItem('honey-bible-last-id', displayVerses[currentIndex].id.toString());
    }
  }, [currentIndex, step, displayVerses, mode, viewType]);

  return (
    <div className="max-w-md mx-auto h-[100dvh] flex flex-col p-3 font-sans bg-[#FFFDF0] text-[#451A03] select-none overflow-hidden text-pretty">
      
      <header className="py-2 text-center flex flex-col items-center flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-2xl" role="img" aria-label="honey">🍯</span>
          <h1 className="text-xl font-black text-[#854D0E] tracking-tight italic uppercase">Kkulsongi</h1>
        </div>
      </header>

      {/* 단계 선택 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar px-1 flex-shrink-0">
        {[1, 2, 3, 4, 5, 6, 7].map(s => (
          <button key={s} onClick={() => handleStepChange(s)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${step === s ? 'bg-[#F59E0B] text-white shadow-md scale-105' : 'bg-white text-[#B45309] border border-[#FEF3C7]'}`}>{s}단계</button>
        ))}
      </div>

      {/* 모드 선택 */}
      <div className="flex bg-[#FEF3C7]/50 rounded-xl shadow-sm p-1 mb-2 border border-[#FDE68A] flex-shrink-0">
        {[{ id: 'view', label: '보기', icon: <Eye size={16}/> }, { id: 'memorize', label: '암송', icon: <BookOpen size={16}/> }, { id: 'referenceMatch', label: '구절맞추기', icon: <Search size={16}/> }].map(m => (
          <button key={m.id} onClick={() => handleModeChange(m.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${mode === m.id ? 'bg-[#451A03] text-white shadow-md' : 'text-[#92400E]'}`}>{m.icon} {m.label}</button>
        ))}
      </div>

      {/* 서브 옵션 영역 */}
      <div className="mb-2 flex-shrink-0">
        <div className="flex flex-col gap-1 mb-1">
          {mode === 'view' ? (
            <div className="flex justify-end gap-2 px-1 h-9">
              <button onClick={() => setViewType('card')} className={`p-2 rounded-lg transition-all ${viewType === 'card' ? 'bg-[#F59E0B] text-white shadow-sm' : 'bg-[#FEF3C7] text-[#D97706]'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewType('list')} className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#F59E0B] text-white shadow-sm' : 'bg-[#FEF3C7] text-[#D97706]'}`}><List size={18} /></button>
            </div>
          ) : (
            <>
              {/* 범위 선택 */}
              <div className="flex bg-[#FEF3C7]/60 rounded-lg p-0.5 h-8">
                <button onClick={() => handleScopeChange('current')} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${practiceScope === 'current' ? 'bg-white text-[#D97706] shadow-sm' : 'text-[#B45309]'}`}>이 단계만</button>
                <button onClick={() => handleScopeChange('cumulative')} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${practiceScope === 'cumulative' ? 'bg-white text-[#D97706] shadow-sm' : 'text-[#B45309]'}`}>누적단계</button>
              </div>
              {/* [새 기능] 암송 완료 포함 여부 */}
              <div className="flex bg-[#FEF3C7]/40 rounded-lg p-0.5 h-8">
                <button onClick={() => handleExcludeToggle(true)} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${excludeMemorized ? 'bg-[#F59E0B] text-white' : 'text-[#B45309]'}`}>미완료만 출제</button>
                <button onClick={() => handleExcludeToggle(false)} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${!excludeMemorized ? 'bg-[#F59E0B] text-white' : 'text-[#B45309]'}`}>전체 출제</button>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-1 text-[9px] text-[#B45309] font-medium py-1 bg-[#FEF3C7]/40 rounded-md">
          <Info size={11} />
          <span>{excludeMemorized && mode !== 'view' ? "암송 완료된 구절은 제외하고 출제됩니다." : "모든 구절이 순서대로/랜덤하게 출제됩니다."}</span>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="relative flex-grow flex flex-col items-center justify-center min-h-0">
        {displayVerses.length > 0 ? (
          <>
            {mode === 'view' && viewType === 'list' ? (
              <div className="w-full h-full bg-white rounded-[1.5rem] shadow-xl border border-[#FEF3C7] overflow-hidden flex flex-col">
                <div className="bg-[#F59E0B] p-2.5 text-white font-bold text-center flex-shrink-0 text-sm">{step}단계 전체 목록</div>
                <div className="flex-grow overflow-y-auto no-scrollbar">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead className="sticky top-0 bg-[#FFFBEB] text-[#854D0E] text-[10px] uppercase z-10">
                      <tr>
                        <th className="p-3 border-b border-[#FEF3C7] text-center w-14 text-[8px]">상태</th>
                        <th className="p-3 border-b border-[#FEF3C7] w-20">장절</th>
                        <th className="p-3 border-b border-[#FEF3C7]">말씀</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px]">
                      {displayVerses.map((v, idx) => {
                        const isMemorized = memorizedIds.includes(v.id);
                        return (
                          <tr key={v.id} onClick={() => toggleMemorized(v.id)} className={`cursor-pointer transition-colors active:opacity-70 ${isMemorized ? 'bg-[#FDE68A]' : (idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]')}`}>
                            <td className="p-3 border-b border-[#FEF3C7] text-center"><span className="text-[#F59E0B]">{isMemorized ? <CheckSquare size={20} /> : <Square size={20} />}</span></td>
                            <td className={`p-3 align-top font-bold border-b border-[#FEF3C7] text-[11px] ${isMemorized ? 'text-[#854D0E]' : 'text-[#D97706]'}`}>{v.ref}</td>
                            <td className={`p-3 align-top leading-relaxed border-b border-[#FEF3C7] break-keep ${isMemorized ? 'font-medium' : ''}`}>{v.content}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center min-h-0">
                <AnimatePresence mode="wait">
                  <Motion.div
                    key={`${mode}-${step}-${practiceScope}-${currentIndex}-${excludeMemorized}`}
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full bg-white rounded-[2rem] shadow-xl shadow-amber-200/20 p-6 flex flex-col items-center border border-[#FEF3C7] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#F59E0B]" />
                    <div className="h-10 flex items-center justify-center w-full mb-2 flex-shrink-0 text-center">
                      {mode === 'referenceMatch' ? (
                        showAnswer ? <h2 className="text-xl font-black text-[#D97706]">{displayVerses[currentIndex]?.ref}</h2> : <div className="px-3 py-1 bg-[#FFFBEB] rounded-lg text-[#D97706]/40 font-bold text-xs border border-dashed border-[#FDE68A]">어느 장절일까요?</div>
                      ) : (
                        <h2 className="text-xl font-black text-[#451A03]">{displayVerses[currentIndex]?.ref}</h2>
                      )}
                    </div>
                    <div className="flex-grow w-full overflow-y-auto px-2 flex flex-col items-center no-scrollbar">
                      <div className="m-auto w-full text-center py-4">
                        {mode === 'memorize' ? (
                          showAnswer ? <p className="text-[1.15rem] font-bold leading-relaxed text-[#D97706] break-keep">{displayVerses[currentIndex]?.content}</p> : <p className="text-[#D97706]/40 italic text-sm font-medium px-4">말씀을 암송해 보세요</p>
                        ) : (
                          <p className="text-[1.15rem] font-bold leading-relaxed text-[#451A03] break-keep">{displayVerses[currentIndex]?.content}</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-2 mt-4 flex-shrink-0">
                      {mode !== 'view' ? (
                        <>
                          <button 
                            onClick={() => setShowAnswer(!showAnswer)}
                            className={`w-full py-3 rounded-xl font-bold text-sm border-2 transition-all ${showAnswer ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-inner' : 'bg-white border-[#F59E0B] text-[#D97706]'}`}
                          >
                            {showAnswer ? "정답 가리기" : "정답 보기 (클릭)"}
                          </button>
                          
                          <div className="flex gap-2">
                            <button onClick={nextVerse} className="flex-1 py-3 bg-[#FEF3C7] text-[#92400E] rounded-xl font-bold text-xs active:scale-95 transition-all">다음 문제</button>
                            <button onClick={() => { toggleMemorized(displayVerses[currentIndex].id); nextVerse(); }} className="flex-1 py-3 bg-[#451A03] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"><CheckCircle2 size={14} /> 암송 완료</button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => toggleMemorized(displayVerses[currentIndex].id)} className={`w-full py-3 rounded-xl font-bold text-sm border-2 transition-all ${memorizedIds.includes(displayVerses[currentIndex].id) ? 'bg-[#F59E0B] border-[#F59E0B] text-white' : 'bg-white border-[#FDE68A] text-[#B45309]'}`}>
                          {memorizedIds.includes(displayVerses[currentIndex].id) ? '🍯 암송 완료되었습니다!' : '🍯 암송 완료 시 클릭'}
                        </button>
                      )}
                    </div>
                  </Motion.div>
                </AnimatePresence>
                <div className="mt-3 flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1 bg-[#FEF3C7] rounded-full text-[9px] font-black text-[#92400E] tracking-wider">{currentIndex + 1} / {displayVerses.length}</div>
                  {mode !== 'view' && <button onClick={shuffleCurrent} className="p-1 text-[#D97706]"><RefreshCw size={12} /></button>}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center flex-grow">
            <span className="text-4xl mb-4">🐝</span>
            <p className="text-[#D97706] font-bold leading-relaxed text-sm">와우! 이 단계의 모든 말씀을<br/>꿀꺽 암송하셨습니다!</p>
            <button onClick={() => { if(confirm("모든 암송 기록이 초기화됩니다.")) { localStorage.removeItem('honey-bible-memorized-ids'); setMemorizedIds([]); window.location.reload(); } }} className="mt-8 text-[10px] text-slate-400 underline italic tracking-tight">전체 암송 기록 초기화</button>
          </div>
        )}
      </div>

      {mode === 'view' && viewType === 'card' && displayVerses.length > 0 && (
        <div className="flex gap-2 mt-3 mb-2 flex-shrink-0">
          <button onClick={prevVerse} className="p-3 bg-white rounded-2xl shadow-sm text-[#D97706] border border-[#FEF3C7] active:bg-[#FFFBEB]"><ChevronLeft size={24} strokeWidth={3} /></button>
          <button onClick={nextVerse} className="flex-grow py-3 bg-[#F59E0B] rounded-2xl shadow-md text-white font-bold text-lg flex items-center justify-center gap-1 active:scale-95">다음 말씀 <ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default App;