import React, { useState } from 'react';
import { Schedule } from '../types';
import PlusIcon from './icons/PlusIcon';

interface ScheduleListProps {
  schedules: Schedule[];
  onSelectSchedule: (schedule: Schedule) => void;
  onCreateNew: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onViewFeedback: () => void;
  onAnalyzeLesson: () => void;
  hasUnsavedChanges: boolean;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ schedules, onSelectSchedule, onCreateNew, onBackup, onRestore, onViewFeedback, onAnalyzeLesson, hasUnsavedChanges }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(true);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onRestore(file);
      event.target.value = '';
    }
  };
  
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
            <h2 style={{fontSize: '2rem', color: 'var(--accent-orange)'}}>Histórico de Aulas</h2>
            <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '60ch'}}>
              Aqui estão todas as aulas que você gerou. Clique para ver detalhes, dar feedback ou baixar o PDF novamente.
            </p>
        </div>
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                style={{ display: 'none' }} 
            />
            <button onClick={onViewFeedback} className="btn btn-secondary">
                Ver Feedbacks
            </button>
            <button onClick={handleRestoreClick} className="btn btn-secondary">
                Restaurar
            </button>
            <button onClick={onBackup} className={`btn btn-secondary ${hasUnsavedChanges ? 'unsaved-changes' : ''}`}>
                {hasUnsavedChanges ? 'Salvar Backup (Pendente)' : 'Salvar Backup'}
            </button>
            <button onClick={onAnalyzeLesson} className="btn btn-secondary">
                Analisar Aula Anterior
            </button>
            <button onClick={onCreateNew} className="btn btn-primary">
                <PlusIcon />
                Criar Novo
            </button>
        </div>
      </div>
      
      {showRestorePrompt && (
        <div className="restore-prompt">
          <div>
            <p style={{fontWeight: 600, color: 'var(--text-primary)'}}>Deseja continuar de onde parou?</p>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem'}}>Para garantir que seu progresso não seja perdido, você pode restaurar um backup recente.</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button onClick={handleRestoreClick} className="btn btn-primary">Restaurar Backup</button>
            <button onClick={() => setShowRestorePrompt(false)} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem', padding: '0 0.5rem', lineHeight: 1}}>&times;</button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="content-card" style={{textAlign: 'center', padding: '4rem'}}>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.125rem'}}>Nenhum cronograma encontrado.</p>
          <p className="text-gray-300 mt-2">Clique em "Criar Novo" para começar.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
          {schedules.map(schedule => (
            <div
              key={schedule.id}
              onClick={() => onSelectSchedule(schedule)}
              className="content-card interactive"
              style={{padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}
            >
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <h3 style={{fontSize: '1.25rem', color: 'var(--accent-orange)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem'}}>{schedule.title}</h3>
                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px', flexShrink: 0}}>{new Date(schedule.classDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{schedule.theme}</p>
              </div>
              <p style={{marginTop: '1rem', backgroundColor: 'var(--input-border)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-start', padding: '0.25rem 0.75rem', borderRadius: '9999px'}}>
                {schedule.targetAudience}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;