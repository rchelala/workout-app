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
import {
  analyzeMealPhoto,
  addMacroLog,
  uploadMealPhoto,
  deleteMacroLog,
  getMacroDatesWithEntries,
  getRecentUniqueMeals,
} from '@/services/macroService';
import type { MealAnalysisResult, MacroLog, MacroSource } from '@/types/macro';
import { todayISO } from '@/utils/formatters';

type ActiveTab = 'camera' | 'search' | 'manual' | 'recent';

const TAB_LABELS: Record<ActiveTab, string> = {
  camera: 'AI Photo',
  search: 'Search',
  manual: 'Manual',
  recent: 'Recent',
};

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('camera');
  const [pendingSource, setPendingSource] = useState<MacroSource>('ai_photo');
  const [showTextFallback, setShowTextFallback] = useState(false);

  const [recentMeals, setRecentMeals] = useState<MacroLog[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentLoaded, setRecentLoaded] = useState(false);
  const [addingRecentId, setAddingRecentId] = useState<string | null>(null);

  const refreshEntryDates = useCallback(async () => {
    if (!user) return;
    const dates = await getMacroDatesWithEntries(user.uid);
    setDatesWithEntries(new Set(dates));
  }, [user]);

  useEffect(() => {
    refreshEntryDates();
  }, [refreshEntryDates]);

  const loadRecentMeals = useCallback(async () => {
    if (!user || recentLoaded) return;
    setRecentLoading(true);
    try {
      const meals = await getRecentUniqueMeals(user.uid);
      setRecentMeals(meals);
      setRecentLoaded(true);
    } finally {
      setRecentLoading(false);
    }
  }, [user, recentLoaded]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'recent') loadRecentMeals();
  };

  const handleUploadReady = async (
    base64: string,
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  ) => {
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

  const handleSaveManual = async (data: {
    mealDescription: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }) => {
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

  const handleAddRecent = async (meal: MacroLog) => {
    if (!user) return;
    setAddingRecentId(meal.logId);
    try {
      await addMacroLog(user.uid, {
        date: selectedDate,
        source: 'manual',
        imageUrl: null,
        mealDescription: meal.mealDescription,
        calories: meal.calories,
        proteinG: meal.proteinG,
        carbsG: meal.carbsG,
        fatG: meal.fatG,
        aiRawResponse: null,
      });
      refetch();
      refreshEntryDates();
    } finally {
      setAddingRecentId(null);
    }
  };

  const isToday = selectedDate === todayISO();
  const mealsHeading = isToday
    ? "Today's Meals"
    : `Meals on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;

  return (
    <AppShell title="Macros">
      <MacroCalendar
        selectedDate={selectedDate}
        datesWithEntries={datesWithEntries}
        onSelectDate={setSelectedDate}
      />

      {userProfile && (
        <section className="mb-6">
          {loading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : (
            <DailyMacroSummary totals={totals} targets={userProfile} />
          )}
        </section>
      )}

      {logs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold text-textPrimary mb-3">{mealsHeading}</h2>
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.logId} className="bg-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-textPrimary flex-1 mr-2">
                    {log.mealDescription}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        log.source === 'ai_photo'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-surfaceHigh text-textMuted'
                      }`}
                    >
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
                  {new Date(log.loggedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isToday && (
        <>
          <div className="flex bg-surface rounded-xl p-1 mb-4">
            {(['camera', 'search', 'manual', 'recent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={[
                  'flex-1 py-2 text-xs font-medium rounded-lg transition-colors',
                  activeTab === tab ? 'bg-accent text-white' : 'text-textMuted',
                ].join(' ')}
              >
                {TAB_LABELS[tab]}
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
                      <Spinner size="sm" />
                      <span className="text-sm">Analyzing meal…</span>
                    </div>
                  )}
                  {analyzeError && (
                    <>
                      <p className="text-xs text-danger mt-2">{analyzeError}</p>
                      <div className="mt-3">
                        <p className="text-xs text-textMuted mb-2">
                          Try describing your meal instead:
                        </p>
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
          ) : activeTab === 'manual' ? (
            <MacroManualForm onSubmit={handleSaveManual} />
          ) : (
            <section>
              {recentLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : recentMeals.length === 0 ? (
                <p className="text-sm text-textMuted text-center py-8">
                  No meals logged yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentMeals.map((meal) => (
                    <div
                      key={meal.logId}
                      className="bg-surface rounded-xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-textPrimary truncate">
                          {meal.mealDescription}
                        </p>
                        <p className="text-xs text-textMuted mt-1">
                          {meal.calories} kcal · {meal.proteinG}g protein · {meal.carbsG}g carbs · {meal.fatG}g fat
                        </p>
                        <p className="text-xs text-textMuted mt-0.5">
                          Last logged: {new Date(meal.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddRecent(meal)}
                        disabled={addingRecentId === meal.logId}
                        className="bg-accentGreen text-background rounded-lg px-3 py-2 text-xs font-bold flex-shrink-0 disabled:opacity-50"
                      >
                        {addingRecentId === meal.logId ? <Spinner size="sm" /> : '+ Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}
