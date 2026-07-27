'use client';

import { useState, useRef } from 'react';
import { Bug, Camera, X, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitErrorFeedback, ErrorContext } from '@/lib/error-feedback';
import { toast } from 'sonner';

interface ErrorFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorInfo?: ErrorContext | null;
}

type Severity = 'low' | 'medium' | 'high' | 'critical';

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-700 border-red-300' },
];

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ErrorFeedbackDialog({
  open,
  onOpenChange,
  errorInfo,
}: ErrorFeedbackDialogProps) {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [includeTechInfo, setIncludeTechInfo] = useState(true);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Formato não suportado: ${file.name}`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Ficheiro demasiado grande: ${file.name} (máx. 5MB)`);
        return false;
      }
      return true;
    });

    const remaining = MAX_IMAGES - screenshots.length;
    const filesToAdd = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      toast.error(`Apenas pode adicionar ${remaining} imagem(ns) adicional(is)`);
    }

    const newScreenshots = [...screenshots, ...filesToAdd];
    setScreenshots(newScreenshots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Por favor, descreva o que estava a fazer');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        message: message.trim(),
        severity,
        error_message: errorInfo?.message,
        error_stack: includeTechInfo ? errorInfo?.stack : undefined,
        component_stack: includeTechInfo ? errorInfo?.componentStack : undefined,
        url: errorInfo?.url || (typeof window !== 'undefined' ? window.location.href : ''),
        user_agent: errorInfo?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
        include_tech_info: includeTechInfo,
        screenshotFiles: screenshots,
      };

      const result = await submitErrorFeedback(payload);

      if (result.success) {
        setIsSuccess(true);
        toast.success('Obrigado! O teu feedback foi enviado à equipa.');
        
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        toast.error(result.error || 'Erro ao enviar feedback');
      }
    } catch {
      toast.error('Erro inesperado ao enviar feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSeverity('medium');
    setIncludeTechInfo(true);
    setScreenshots([]);
    setPreviews([]);
    setIsSuccess(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetForm();
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-purple-600" />
            Reportar Erro
          </DialogTitle>
          <DialogDescription>
            Ajuda-nos a melhorar o KerHome. O teu feedback é anónimo e confidencial.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Feedback Enviado!</p>
            <p className="text-sm text-gray-500 mt-1">
              Obrigado por nos ajudar a melhorar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-message">
                Descreve o que estavas a fazer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Ex: Estava a tentar agendar uma visita para o imóvel X..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Severidade</Label>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSeverity(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                      severity === option.value
                        ? option.color
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Screenshot (opcional)
                </span>
                <span className="text-xs text-gray-500">
                  {screenshots.length}/{MAX_IMAGES}
                </span>
              </Label>
              
              {screenshots.length < MAX_IMAGES && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Adicionar Imagem
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou WebP • Máx. 5MB cada
                  </p>
                </div>
              )}

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Screenshot ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include-tech-info"
                checked={includeTechInfo}
                onChange={(e) => setIncludeTechInfo(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="include-tech-info" className="text-sm text-gray-600">
                Incluir informações técnicas (URL, navegador, timestamp)
              </Label>
            </div>

            {errorInfo?.message && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Erro detectado:</p>
                <p className="text-sm text-gray-700 font-mono break-all">
                  {errorInfo.message}
                </p>
              </div>
            )}
          </div>
        )}

        {!isSuccess && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A enviar...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
