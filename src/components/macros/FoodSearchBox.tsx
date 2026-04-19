import { useState } from 'react';
import { Search } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { searchFoodNutrition } from '@/services/macroService';
import type { MealAnalysisResult } from '@/types/macro';

interface FoodSearchBoxProps {
  onResult: (result: MealAnalysisResult) => void;
}

export function FoodSearchBox({ onResult }: FoodSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await searchFoodNutrition(query.trim());
      onResult(result);
    } catch {
      setError("Couldn't find that food. Try being more specific.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a food (e.g. Cliff Bar, banana, chicken breast)"
          className="flex-1 h-12 px-4 rounded-xl bg-surfaceHigh text-textPrimary text-sm border border-border focus:outline-none focus:border-accent placeholder:text-textDisabled transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-12 px-4 bg-accent text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-opacity"
        >
          {loading ? <Spinner size="sm" color="border-white" /> : <Search size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
