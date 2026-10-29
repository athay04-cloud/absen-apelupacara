import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, PenTool, Upload } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  currentSignature?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  title,
  onClose,
  onSave,
  currentSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#111827');
  const [penWidth, setPenWidth] = useState(2.5);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // If current signature exists, draw it
            if (currentSignature) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setHasDrawn(true);
              };
              img.src = currentSignature;
            } else {
              setHasDrawn(false);
            }
          }
        }
      }, 50);
    }
  }, [isOpen, currentSignature]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Fit within canvas keeping aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        setHasDrawn(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Tanda tangani langsung di bidang kanvas di bawah menggunakan mouse / layar sentuh, atau unggah foto tanda tangan dari komputer Anda.
          </p>

          {/* Canvas Board */}
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              className="w-full h-44 touch-none bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 font-medium text-sm">
                Tanda tangan di sini
              </div>
            )}
            <div className="absolute bottom-2 left-4 right-4 border-b border-slate-200 pointer-events-none opacity-40"></div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">Warna:</span>
              <button
                type="button"
                onClick={() => setPenColor('#111827')}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${
                  penColor === '#111827' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
                }`}
                title="Hitam"
              />
              <button
                type="button"
                onClick={() => setPenColor('#1e40af')}
                className={`w-5 h-5 rounded-full bg-blue-800 border-2 ${
                  penColor === '#1e40af' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
                }`}
                title="Biru Kedinasan"
              />
              <div className="h-4 w-px bg-slate-200 ml-1"></div>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-blue-600 font-medium ml-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah File</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bersihkan Kanvas</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Tanda Tangan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
