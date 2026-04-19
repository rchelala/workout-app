import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MacroCameraUpload } from '@/components/macros/MacroCameraUpload';
import { MacroResultCard } from '@/components/macros/MacroResultCard';
import { MacroManualForm } from '@/components/macros/MacroManualForm';
import { MacroTextForm } from '@/components/macros/MacroTextForm';
import { FoodSearchBox } from '@/components/macros/FoodSearchBox';
import { DailyMacroSummary } from '@/components/macros/DailyMacroSummary';
import { MacroCalendar } from '@/components/macros/MacroCalendar';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useMacros } from '@/hooks/useMacros';
import { analyzeMealPhoto, addMacroLog, uploadMealPhoto, deleteMacroLog, getMacroDatesWithEntries } from '@/services/macroService';
import type { MealAnalysisResult, MacroSource } from '@/types/macro';
import { todayISO } from '@/utils/formatters';

export function MacrosPage() {
  const { user, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => todayISO());
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(new Set());

  const { totals, logs, loading, refetch } = useMacros(user?.uid ?? null, selectedDate);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<MealAnalysisResult | null>(null);
  const [pendingBase64, setPendingBase64] = useState('');
  const [pendingMime, setPendingMime] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'search' | 'manual'>('camera');
  const [pendingSource, setPendingSource] = useState<MacroSource>('ai_photo');
  const [showTextFallback, setShowTextFallback] = useState(false);

  const refreshEntryDates = useCallback(async () => {
    if (!user) return;
    const dates = await getMacroDatesWithEntries(user.uid);
    setDatesWithEntries(new Set(dates));
  }, [user]);

  useEffect(() => {
    refreshEntryDates();
  }, [refreshEntryDates]);

  const handleUploadReady = async (base64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/webp') => {
    setPendingBase64(base64);
    setPendingMime(mimeType);
    setPendingSource('ai_photo');
    setAnalyzeError(null);
    setShowTextFallback(false);
    setAnalyzing(true);
    try {
      const result = await analyzeMealPhoto(base64, mimeType);
      setPendingResult(result);
    } catch {
      setAnalyzeError('Could not analyze the photo. Try manual entry instead.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAI = async (edited: MealAnalysisResult) => {
    if (!user) return;
    setSaving(true);
    let imageUrl: string | null = null;
    if (pendingBase64) {
      try {
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
        imageUrl = await Promise.race([
          uploadMealPhoto(user.uid, pendingBase64, pendingMime),
          timeout,
        ]);
      } catch { /* storage optional */ }
    }
    try {
      await addMacroLog(user.uid, {
        date: selectedDate,
        source: pendingSource,
        imageUrl,
        mealDescription: edited.meal_description,
        calories: edited.calories,
        proteinG: edited.protein_g,
        carbsG: edited.carbs_g,
        fatG: edited.fat_g,
        aiRawResponse: null,
      });
      setPendingResult(null);
      setPendingBase64('');
      refetch();
      refreshEntryDates();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logId: string) => {
    setDeletingId(logId);
    try {
      await deleteMacroLog(logId);
      refetch();
      refreshEntryDates();
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveManual = async (data: { mealDescription: string; calories: number; proteinG: number; carbsG: number; fatG: number }) => {
    if (!user) return;
    await addMacroLog(user.uid, {
      date: selectedDate,
      source: 'manual',
      imageUrl: null,
      mealDescription: data.mealDescription,
      calories: data.calories,
      proteinG: data.proteinG,
      carbsG: data.carbsG,
      fatG: data.fatG,
      aiRawResponse: null,
    });
    refetch();
    refreshEntryDates();
  };

  const isToday = selectedDate === todayISO();
  const mealsHeading = isToday
    ? "Today's Meals"
    : `Meals on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <AppShell title="Macros">
      {/* Calendar */}
      <MacroCalendar
        selectedDate={selectedDate}
        datesWithEntries={datesWithEntries}
        onSelectDate={setSelectedDate}
      />

      {/* Summary */}
      {userProfile && (
        <section className="mb-6">
          {loading ? <div className="flex justify-center py-4"><Spinner /></div> : (
            <DailyMacroSummary totals={totals} targets={userProfile} />
          )}
        </section>
      )}

      {/* Meals list */}
      {logs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold text-textPrimary mb-3">{mealsHeading}</h2>
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.logId} className="bg-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-textPrimary flex-1 mr-2">{log.mealDescription}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.source === 'ai_photo' ? 'bg-accent/20 text-accent' : 'bg-surfaceHigh text-textMuted'}`}>
                      {log.source === 'ai_photo' ? 'AI' : 'Manual'}
                    </span>
                    <button
                      onClick={() => handleDelete(log.logId)}
                      disabled={deletingId === log.logId}
                      className="p-1 rounded-lg text-textMuted hover:text-danger transition-colors disabled:opacity-50"
                    >
                      {deletingId === log.logId ? <Spinner size="sm" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold text-textPrimary">{log.calories}</p>
                    <p className="text-xs text-textMuted">kcal</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-textPrimary">{log.proteinG}g</p>
                    <p className="text-xs text-textMuted">Protein</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-textPrimary">{log.carbsG}g</p>
                    <p className="text-xs text-textMuted">Carbs</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-textPrimary">{log.fatG}g</p>
                    <p className="text-xs text-textMuted">Fat</p>
                  </div>
                </div>
                <p className="text-xs text-textMuted mt-2">
                  {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add meal — only shown for today */}
      {isToday && (
        <>
          <div className="flex bg-surface rounded-xl p-1 mb-4">
            {(['camera', 'search', 'manual'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === tab ? 'bg-accent text-white' : 'text-textMuted',
                ].join(' ')}
              >
                {tab === 'camera' ? 'AI Photo' : tab === 'search' ? 'Search Food' : 'Manual Entry'}
              </button>
            ))}
          </div>

          {activeTab === 'camera' ? (
            <section>
              {pendingResult ? (
                <MacroResultCard
                  result={pendingResult}
                  onSave={handleSaveAI}
                  onDiscard={() => { setPendingResult(null); setPendingBase64(''); }}
                  saving={saving}
                />
              ) : (
                <>
                  <MacroCameraUpload onUploadReady={handleUploadReady} />
                  {analyzing && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-textMuted">
                      <Spinner size="sm" /> <span className="text-sm">Analyzing meal…</span>
                    </div>
                  )}
                  {analyzeError && (
                    <>
                      <p className="text-xs text-danger mt-2">{analyzeError}</p>
                      <div className="mt-3">
                        <p className="text-xs text-textMuted mb-2">Try describing your meal instead:</p>
                        {showTextFallback ? (
                          <MacroTextForm
                            onResult={(result) => {
                              setPendingResult(result);
                              setPendingSource('manual');
                              setShowTextFallback(false);
                              setAnalyzeError(null);
                            }}
                            onCancel={() => setShowTextFallback(false)}
                          />
                        ) : (
                          <button
                            onClick={() => setShowTextFallback(true)}
                            className="text-sm text-accent underline"
                          >
                            Describe your meal instead →
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          ) : activeTab === 'search' ? (
            <section>
              {pendingResult ? (
                <MacroResultCard
                  result={pendingResult}
                  onSave={handleSaveAI}
                  onDiscard={() => { setPendingResult(null); setPendingBase64(''); }}
                  saving={saving}
                />
              ) : (
                <FoodSearchBox
                  onResult={(result) => {
                    setPendingSource('manual');
                    setPendingBase64('');
                    setPendingResult(result);
                  }}
                />
              )}
            </section>
          ) : (
            <MacroManualForm onSubmit={handleSaveManual} />
          )}
        </>
      )}
    </AppShell>
  );
}
