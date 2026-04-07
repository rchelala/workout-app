import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MacroCameraUpload } from '@/components/macros/MacroCameraUpload';
import { MacroResultCard } from '@/components/macros/MacroResultCard';
import { MacroManualForm } from '@/components/macros/MacroManualForm';
import { DailyMacroSummary } from '@/components/macros/DailyMacroSummary';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useMacros } from '@/hooks/useMacros';
import { analyzeMealPhoto, addMacroLog, uploadMealPhoto } from '@/services/macroService';
import type { MealAnalysisResult } from '@/types/macro';
import { todayISO } from '@/utils/formatters';

export function MacrosPage() {
  const { user, userProfile } = useAuth();
  const { totals, logs, loading, refetch } = useMacros(user?.uid ?? null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<MealAnalysisResult | null>(null);
  const [pendingBase64, setPendingBase64] = useState('');
  const [pendingMime, setPendingMime] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');

  const handleUploadReady = async (base64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/webp') => {
    setPendingBase64(base64);
    setPendingMime(mimeType);
    setAnalyzeError(null);
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

  const handleSaveAI = async () => {
    if (!user || !pendingResult) return;
    setSaving(true);
    let imageUrl: string | null = null;
    try {
      imageUrl = await uploadMealPhoto(user.uid, pendingBase64, pendingMime);
    } catch { /* storage optional */ }
    await addMacroLog(user.uid, {
      date: todayISO(),
      source: 'ai_photo',
      imageUrl,
      mealDescription: pendingResult.meal_description,
      calories: pendingResult.calories,
      proteinG: pendingResult.protein_g,
      carbsG: pendingResult.carbs_g,
      fatG: pendingResult.fat_g,
      aiRawResponse: null,
    });
    setPendingResult(null);
    refetch();
    setSaving(false);
  };

  const handleSaveManual = async (data: { mealDescription: string; calories: number; proteinG: number; carbsG: number; fatG: number }) => {
    if (!user) return;
    await addMacroLog(user.uid, {
      date: todayISO(),
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
  };

  return (
    <AppShell title="Macros">
      {/* Summary */}
      {userProfile && (
        <section className="mb-6">
          {loading ? <div className="flex justify-center py-4"><Spinner /></div> : (
            <DailyMacroSummary totals={totals} targets={userProfile} />
          )}
        </section>
      )}

      {/* Today's Meals */}
      {logs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold text-textPrimary mb-3">Today's Meals</h2>
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.logId} className="bg-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-textPrimary flex-1 mr-2">{log.mealDescription}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.source === 'ai_photo' ? 'bg-accent/20 text-accent' : 'bg-surfaceHigh text-textMuted'}`}>
                    {log.source === 'ai_photo' ? 'AI' : 'Manual'}
                  </span>
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

      {/* Tabs */}
      <div className="flex bg-surface rounded-xl p-1 mb-4">
        {(['camera', 'manual'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize',
              activeTab === tab ? 'bg-accent text-white' : 'text-textMuted',
            ].join(' ')}
          >
            {tab === 'camera' ? 'AI Photo' : 'Manual Entry'}
          </button>
        ))}
      </div>

      {activeTab === 'camera' ? (
        <section>
          {pendingResult ? (
            <MacroResultCard
              result={pendingResult}
              onSave={handleSaveAI}
              onDiscard={() => setPendingResult(null)}
              saving={saving}
            />
          ) : (
            <>
              <MacroCameraUpload
                onUploadReady={handleUploadReady}
              />
              {analyzing && (
                <div className="flex items-center justify-center gap-2 mt-4 text-textMuted">
                  <Spinner size="sm" /> <span className="text-sm">Analyzing meal…</span>
                </div>
              )}
              {analyzeError && <p className="text-xs text-danger mt-2">{analyzeError}</p>}
            </>
          )}
        </section>
      ) : (
        <MacroManualForm onSubmit={handleSaveManual} />
      )}
    </AppShell>
  );
}
