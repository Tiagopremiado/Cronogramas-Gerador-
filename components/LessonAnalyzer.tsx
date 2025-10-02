import React, { useState } from 'react';
import { analyzeLessonAndSuggestNext } from '../services/geminiService';
import { readPdfAsText } from '../utils';

interface LessonAnalyzerProps {
  onBack: () => void;
  onCreate: (context: string) => void;
}

const LessonAnalyzer: React.FC<LessonAnalyzerProps> = ({ onBack, onCreate }) => {
  const [lessonText, setLessonText] = useState('');
  const [generateNext, setGenerateNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      if (file.type === 'application/pdf') {
        const text = await readPdfAsText(file);
        setLessonText(text);
      } else {
         throw new Error('Formato de arquivo não suportado. Por favor, envie um PDF.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o arquivo.');
      setLessonText('');
    } finally {
      setIsLoading(false);
      event.target.value = ''; // Limpa o input para permitir o reenvio do mesmo arquivo
    }
  };

  const handleAnalyze = async () => {
    if (!lessonText.trim()) {
      setError('Por favor, cole o texto da aula ou envie um arquivo.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const suggestion = await analyzeLessonAndSuggestNext(lessonText);
      if (generateNext) {
        onCreate(suggestion);
      } else {
        alert(`Sugestão Gerada:\n\n"${suggestion}"\n\nVocê pode usar este texto para criar um novo cronograma manualmente.`);
        onBack();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h2 style={{fontSize: '2rem', color: 'var(--accent-orange)'}}>Analisar Aula Anterior</h2>
          <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>Use uma aula passada como ponto de partida para a próxima.</p>
        </div>
        <button onClick={onBack} className="btn btn-secondary">&larr; Voltar para o Histórico</button>
      </div>

      <div className="content-card" style={{padding: '1.5rem 2rem'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <p style={{color: 'var(--text-primary)'}}>
            Cole o conteúdo do seu plano de aula anterior no campo abaixo ou envie o arquivo PDF para que a IA possa analisá-lo e sugerir uma continuação.
          </p>
          
          <div>
            <label htmlFor="lessonText" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>
              Conteúdo da Aula Anterior (Texto ou PDF)
            </label>
            <textarea
              id="lessonText"
              rows={10}
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              placeholder="Cole o texto do seu plano de aula aqui..."
              className="form-textarea"
              disabled={isLoading}
            />
          </div>

          <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>OU</div>

          <div>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                style={{ display: 'none' }} 
            />
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-secondary"
                disabled={isLoading}
                style={{width: '100%', justifyContent: 'center'}}
            >
                {isLoading ? 'Processando Arquivo...' : 'Enviar PDF da Última Aula'}
            </button>
          </div>
          
          {error && <p style={{color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center'}}>{error}</p>}
          
          <div style={{borderTop: '1px solid var(--input-border)', paddingTop: '1.5rem', marginTop: '0.5rem'}}>
            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem'}}>
              <input
                type="checkbox"
                checked={generateNext}
                onChange={(e) => setGenerateNext(e.target.checked)}
                style={{width: '1rem', height: '1rem'}}
              />
              <span style={{color: 'var(--text-primary)'}}>Gerar o cronograma da próxima aula em sequência</span>
            </label>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '2.25rem'}}>
              Se marcado, você será levado para a tela de criação com a sugestão da IA já aplicada.
            </p>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
            <button 
              onClick={handleAnalyze} 
              className="btn btn-primary"
              disabled={isLoading || !lessonText}
            >
              {isLoading ? 'Analisando...' : 'Analisar e Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonAnalyzer;