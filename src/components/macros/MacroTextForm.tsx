import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { analyzeMealText } from '@/services/macroService';
import type { MealAnalysisResult } from '@/types/macro';

interface MacroTextFormProps {
  onResult: (result: MealAnalysisResult) => void;
  onCancel: () => void;
}

export function MacroTextForm({ onResult, onCancel }: MacroTextFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeMealText(text.trim());
      onResult(result);
    } catch {
      setError('Could not analyze your meal description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. 2 scrambled eggs, 1 slice whole wheat toast, and a glass of orange juice"
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-surfaceHigh text-textPrimary text-sm border border-border focus:outline-none focus:border-accent placeholder:text-textDisabled transition-colors resize-none"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-2 text-textMuted">
          <Spinner size="sm" />
          <span className="text-sm">Analyzing meal…</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            Analyze Meal
          </Button>
        </div>
      )}
    </form>
  );
}
