import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { validateImageFile, resizeAndEncodeBase64 } from '@/utils/imageUtils';

interface MacroCameraUploadProps {
  onUploadReady: (base64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/webp', previewUrl: string) => void;
}

export function MacroCameraUpload({ onUploadReady }: MacroCameraUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError); return; }
    setProcessing(true);
    try {
      const { base64, mimeType } = await resizeAndEncodeBase64(file);
      const previewUrl = `data:image/jpeg;base64,${base64}`;
      setPreview(previewUrl);
      onUploadReady(base64, mimeType, previewUrl);
    } catch {
      setError('Failed to process image.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Meal preview" className="w-full h-48 object-cover rounded-2xl" />
          <button
            onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ''; }}
            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-textMuted hover:border-accent transition-colors"
        >
          <Camera size={32} />
          <span className="text-sm">Take photo or upload</span>
        </button>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      {!preview && (
        <Button variant="ghost" onClick={() => inputRef.current?.click()} loading={processing}>
          <Upload size={16} /> Select from Library
        </Button>
      )}
    </div>
  );
}
