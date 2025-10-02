import React from 'react';
import { Schedule } from '../types';

interface FeedbackHistoryProps {
  schedules: Schedule[];
  onBack: () => void;
}

const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ schedules, onBack }) => {
  const schedulesWithFeedback = schedules.filter(
    s => s.feedback && (s.feedback.positive || s.feedback.improvement || s.feedback.ideas)
  ).sort((a, b) => new Date(b.classDate).getTime() - new Date(a.classDate).getTime());

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
            <h2 style={{fontSize: '2rem', color: 'var(--accent-orange)'}}>Histórico de Feedbacks</h2>
            <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>Feedbacks registrados das aulas anteriores.</p>
        </div>
        <button onClick={onBack} className="btn btn-secondary">
          &larr; Voltar para o Histórico
        </button>
      </div>

      {schedulesWithFeedback.length === 0 ? (
        <div className="content-card" style={{textAlign: 'center', padding: '4rem'}}>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.125rem'}}>Nenhum feedback encontrado.</p>
          <p style={{color: 'var(--text-primary)', marginTop: '0.5rem'}}>Preencha os campos de feedback nos detalhes de um cronograma para começar.</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {schedulesWithFeedback.map(schedule => (
            <div key={schedule.id} className="content-card" style={{padding: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--input-border)', paddingBottom: '1rem', marginBottom: '1rem'}}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)'}}>{schedule.title}</h3>
                <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>{new Date(schedule.classDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <h4 style={{fontWeight: 600, color: 'var(--success-color)'}}>Pontos Positivos:</h4>
                  <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>{schedule.feedback.positive || 'Nenhum registrado.'}</p>
                </div>
                <div>
                  <h4 style={{fontWeight: 600, color: 'var(--warning-color)'}}>Pontos de Melhoria:</h4>
                  <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>{schedule.feedback.improvement || 'Nenhum registrado.'}</p>
                </div>
                <div>
                  <h4 style={{fontWeight: 600, color: 'var(--info-color)'}}>Ideias para Próximas Aulas:</h4>
                  <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>{schedule.feedback.ideas || 'Nenhuma registrada.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;