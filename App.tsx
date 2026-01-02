
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { Layout } from './components/Layout';
import { ReactionGame } from './components/ReactionGame';
import { SCREENING_QUESTIONS, ROUND_TITLES, STROOP_COLORS } from './constants';
import { Screen, AssessmentData, AIAnalysis } from './types';
import { analyzeAssessment } from './services/analysisService';

// --- STROOP TASK COMPONENT ---
const StroopTask: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const [rounds, setRounds] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [currentTask, setCurrentTask] = useState({ word: 'Red', color: '#ef4444' });
  const MAX_ROUNDS = 8;

  const generateTask = useCallback(() => {
    const wordIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    const colorIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    setCurrentTask({
      word: STROOP_COLORS[wordIdx].name,
      color: STROOP_COLORS[colorIdx].hex
    });
  }, []);

  useEffect(() => { generateTask(); }, [generateTask]);

  const handleChoice = (hex: string) => {
    const isCorrect = hex === currentTask.color;
    const newCorrect = isCorrect ? correct + 1 : correct;
    
    if (rounds + 1 >= MAX_ROUNDS) {
      onComplete({ accuracy: (newCorrect / MAX_ROUNDS) * 100 });
    } else {
      setCorrect(newCorrect);
      setRounds(r => r + 1);
      generateTask();
    }
  };

  return (
    <div className="text-center p-4 animate-in fade-in duration-500">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Cognitive Control</h3>
      <p className="text-sm text-slate-500 mb-8">Select the <b>color</b> of the text, not what it reads.</p>
      <div className="bg-slate-50 rounded-3xl p-10 mb-10 flex items-center justify-center min-h-[140px] shadow-inner">
        <div className="text-6xl font-black transition-all" style={{ color: currentTask.color }}>
          {currentTask.word}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {STROOP_COLORS.map(c => (
          <button 
            key={c.hex} 
            onClick={() => handleChoice(c.hex)}
            className="h-16 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-slate-700 bg-white"
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MEMORY TASK COMPONENT ---
const MemoryTask: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing' | 'input' | 'waiting'>('waiting');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [errorCell, setErrorCell] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const GRID_SIZE = 9;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const showSequence = async (seq: number[]) => {
    if (!isMounted.current) return;
    setPhase('showing');
    setActiveCell(null);
    setErrorCell(null);
    setUserSequence([]);
    await new Promise(r => setTimeout(r, 1000));
    
    for (const cellId of seq) {
      if (!isMounted.current) return;
      setActiveCell(cellId);
      await new Promise(r => setTimeout(r, 600));
      setActiveCell(null);
      await new Promise(r => setTimeout(r, 200));
    }
    if (isMounted.current) setPhase('input');
  };

  const startLevel = useCallback(async (currentLevel: number) => {
    const seqLength = 2 + Math.floor(currentLevel / 2); 
    const newSeq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * GRID_SIZE));
    setSequence(newSeq);
    await showSequence(newSeq);
  }, []);

  useEffect(() => { startLevel(1); }, [startLevel]);

  const handleCellClick = (idx: number) => {
    if (phase !== 'input' || busy) return;
    setBusy(true);
    const expected = sequence[userSequence.length];

    if (idx !== expected) {
      setErrorCell(idx);
      setTimeout(() => {
        if (!isMounted.current) return;
        setErrorCell(null);
        setBusy(false);
        const nextLevel = level + 1;
        if (nextLevel > 5) onComplete({ memoryScore: score });
        else {
          setPhase('waiting');
          setLevel(nextLevel);
          setTimeout(() => { if (isMounted.current) startLevel(nextLevel); }, 800);
        }
      }, 500);
      return;
    }

    setActiveCell(idx);
    const nextUserSequence = [...userSequence, idx];
    setUserSequence(nextUserSequence);

    setTimeout(() => {
      if (!isMounted.current) return;
      setActiveCell(null);
      setBusy(false);
      if (nextUserSequence.length === sequence.length) {
        setScore(s => s + 1);
        setPhase('waiting');
        if (level >= 5) onComplete({ memoryScore: score + 1 });
        else {
          setLevel(l => l + 1);
          setTimeout(() => { if (isMounted.current) startLevel(level + 1); }, 800);
        }
      }
    }, 200);
  };

  return (
    <div className="text-center p-4">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Visual Memory</h3>
      <div className="mb-6 flex flex-col items-center gap-2">
        {phase === 'showing' && <span className="text-amber-600 text-xs font-bold uppercase animate-pulse">Memorize the pattern</span>}
        {phase === 'input' && <span className="text-green-600 text-xs font-bold uppercase">Repeat sequence</span>}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full ${i < level ? 'bg-blue-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 w-64 mx-auto">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <button 
            key={i} 
            disabled={phase !== 'input' || busy}
            onMouseDown={() => handleCellClick(i)}
            className={`h-20 rounded-2xl border-4 transition-all ${
              activeCell === i ? 'bg-blue-600 border-blue-400' : 
              errorCell === i ? 'bg-red-500 border-red-700 animate-shake' : 
              'bg-white border-slate-100'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// --- SEQUENCING TASK COMPONENT ---
const SequencingTask: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const [nextNum, setNextNum] = useState(1);
  const startTime = useRef(Date.now());
  const TOTAL = 6;
  const [points, setPoints] = useState<{ id: number, x: number, y: number }[]>([]);

  useEffect(() => {
    const generated: any[] = [];
    for (let i = 0; i < TOTAL; i++) {
      generated.push({ id: i + 1, x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
    }
    setPoints(generated);
  }, []);

  const handleClick = (id: number) => {
    if (id === nextNum) {
      if (id === TOTAL) onComplete({ sequencingTime: Date.now() - startTime.current });
      else setNextNum(n => n + 1);
    }
  };

  return (
    <div className="text-center p-4">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Executive Function</h3>
      <p className="text-sm text-slate-500 mb-8">Tap numbers 1 to {TOTAL} in order.</p>
      <div className="relative w-full h-80 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden shadow-inner">
        {points.map(p => (
          <button
            key={p.id}
            onClick={() => handleClick(p.id)}
            className={`absolute w-12 h-12 rounded-full font-bold transition-all border-4 flex items-center justify-center ${
              p.id < nextNum ? 'bg-green-100 border-green-500 text-green-700 opacity-30' : 
              p.id === nextNum ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-300'
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {p.id}
          </button>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.ONBOARDING);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({ questions: {}, roundStats: {} });
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const resetTest = useCallback(() => {
    setAnalysis(null);
    setQuestionIndex(0);
    setAssessmentData({ questions: {}, roundStats: {} });
    setCurrentScreen(Screen.ONBOARDING);
  }, []);

  const handleNextRound = (key: string, stats: any, next: Screen) => {
    setAssessmentData(prev => ({ ...prev, roundStats: { ...prev.roundStats, [key]: stats } }));
    setCurrentScreen(next);
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const date = new Date().toLocaleDateString();
    const reportID = `NS-${Math.floor(100000 + Math.random() * 900000)}`;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NeuroScreen Report', 20, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`REPORT ID: ${reportID} | DATE: ${date}`, 20, 26);
    doc.text("ALGORITHMIC PERFORMANCE ANALYSIS", 20, 32);

    // Score Circle/Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(150, 10, 40, 40, 3, 3, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(30);
    doc.text(`${analysis.healthScore}`, 170, 32, { align: 'center' });
    doc.setFontSize(8);
    doc.text("HEALTH INDEX", 170, 42, { align: 'center' });

    let y = 55;

    // Summary Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(analysis.summary, 170);
    doc.text(summaryLines, 20, y);
    y += (summaryLines.length * 5) + 15;

    // Data Table
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y, 170, 35, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Quantitative Metrics', 25, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const stats = assessmentData.roundStats;
    doc.text(`Motor Reaction: ${stats.reaction?.averageReactionTime?.toFixed(0)}ms`, 30, y + 20);
    doc.text(`Memory Span: ${stats.memory?.memoryScore} Correct`, 30, y + 27);
    doc.text(`Cognitive Control: ${stats.stroop?.accuracy?.toFixed(0)}%`, 110, y + 20);
    doc.text(`Executive Time: ${stats.sequencing?.sequencingTime}ms`, 110, y + 27);
    y += 50;

    // Indicators
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Indicators', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    analysis.riskIndicators.forEach(text => {
      doc.setFillColor(37, 99, 235);
      doc.circle(23, y - 1, 0.8, 'F');
      doc.text(text, 28, y);
      y += 7;
    });
    y += 10;

    // Recommendations
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Action Plan', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    analysis.recommendations.forEach(text => {
      doc.setFillColor(217, 119, 6);
      doc.circle(23, y - 1, 0.8, 'F');
      doc.text(text, 28, y);
      y += 7;
    });

    // Final Fixed Footer Disclaimer
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(20, 250, 170, 20, 1, 1, 'F');
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(8);
    const disclaimer = "CONFIDENTIAL: This is a screening report, not a clinical diagnosis. Always consult a board-certified neurologist for evaluation. This report is generated based on automated performance thresholds.";
    const discLines = doc.splitTextToSize(disclaimer, 160);
    doc.text(discLines, 25, 258);

    doc.save(`NeuroScreen_Report_${reportID}.pdf`);
  };

  useEffect(() => {
    if (currentScreen === Screen.ANALYSIS) {
      const run = async () => {
        setLoading(true);
        try {
          const res = await analyzeAssessment(assessmentData);
          setAnalysis(res);
          setCurrentScreen(Screen.RESULTS);
        } catch (e) {
          console.error(e);
          resetTest();
        } finally {
          setLoading(false);
        }
      };
      run();
    }
  }, [currentScreen, assessmentData, resetTest]);

  const renderContent = () => {
    switch (currentScreen) {
      case Screen.ONBOARDING:
        return (
          <div className="text-center py-6 animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"><i className="fas fa-brain text-3xl"></i></div>
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">NeuroScreen</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Cognitive screening using rapid performance quantification and automated analysis.</p>
            <button onClick={() => setCurrentScreen(Screen.QUESTIONNAIRE)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Start Assessment</button>
          </div>
        );
      case Screen.QUESTIONNAIRE:
        const q = SCREENING_QUESTIONS[questionIndex];
        return (
          <div className="animate-in slide-in-from-right duration-500">
            <h3 className="text-2xl font-black mb-10 text-slate-800 leading-tight">{q.text}</h3>
            <div className="space-y-3">
              {q.options.map(o => (
                <button key={o.value} onClick={() => {
                  setAssessmentData(prev => ({ ...prev, questions: { ...prev.questions, [q.id]: o.value } }));
                  if (questionIndex < SCREENING_QUESTIONS.length - 1) setQuestionIndex(questionIndex + 1);
                  else setCurrentScreen(Screen.GAME_REACTION);
                }} className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-slate-700 bg-white shadow-sm flex justify-between items-center">
                  <span>{o.label}</span>
                  <i className="fas fa-chevron-right text-slate-300"></i>
                </button>
              ))}
            </div>
          </div>
        );
      case Screen.GAME_REACTION: return <ReactionGame onComplete={(stats) => handleNextRound('reaction', stats, Screen.GAME_MEMORY)} />;
      case Screen.GAME_MEMORY: return <MemoryTask onComplete={(stats) => handleNextRound('memory', stats, Screen.GAME_STROOP)} />;
      case Screen.GAME_STROOP: return <StroopTask onComplete={(stats) => handleNextRound('stroop', stats, Screen.GAME_SEQUENCING)} />;
      case Screen.GAME_SEQUENCING: return <SequencingTask onComplete={(stats) => handleNextRound('sequencing', stats, Screen.ANALYSIS)} />;
      case Screen.ANALYSIS:
        return (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-800">Quantifying Markers...</h3>
            <p className="text-slate-500 mt-2">Generating automated report based on performance data.</p>
          </div>
        );
      case Screen.RESULTS:
        if (!analysis) return null;
        return (
          <div className="animate-in fade-in duration-700">
            <div className="flex flex-col items-center mb-10">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-900 border-8 border-slate-100 flex flex-col items-center justify-center shadow-2xl mb-6">
                 <span className="text-6xl font-black text-white">{analysis.healthScore}</span>
                 <span className="text-[8px] text-blue-400 font-bold tracking-[0.3em]">HEALTH INDEX</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800">Screening Complete</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Analysis Summary</h4>
                <p className="text-slate-700 font-bold leading-relaxed">{analysis.summary}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4">Risk Indicators</h4>
                  <ul className="space-y-3">
                    {analysis.riskIndicators.map((ri, i) => (
                      <li key={i} className="text-xs text-slate-600 font-bold flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" /> {ri}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase mb-4">Recommendations</h4>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-600 font-bold flex gap-3">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" /> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={resetTest} className="flex-1 py-4 bg-slate-100 text-slate-800 rounded-2xl font-bold">New Test</button>
                <button onClick={downloadPDF} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">Download Report</button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Layout title="NeuroScreen">
      {currentScreen !== Screen.ONBOARDING && currentScreen !== Screen.RESULTS && currentScreen !== Screen.ANALYSIS && (
        <div className="mb-10 flex gap-1 h-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex-1 rounded-full ${i <= [Screen.QUESTIONNAIRE, Screen.GAME_REACTION, Screen.GAME_MEMORY, Screen.GAME_STROOP, Screen.GAME_SEQUENCING].indexOf(currentScreen) ? 'bg-blue-600' : 'bg-slate-100'}`} />
          ))}
        </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
