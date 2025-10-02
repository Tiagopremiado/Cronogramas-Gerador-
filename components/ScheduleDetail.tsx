import React, { useState, useEffect } from 'react';
import { Schedule } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import DownloadIcon from './icons/DownloadIcon';
import ScheduleForm from './ScheduleForm';
import { generatePdf } from '../utils';

interface ScheduleDetailProps {
  schedule: Schedule;
  onBack: () => void;
  onDelete: (id: string) => void;
  onSave: (schedule: Schedule) => void;
  nextScheduleContext: Schedule | null;
  onClearNextPrompt: () => void;
  onCreateNext: (suggestion: string) => void;
}

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({ schedule, onBack, onDelete, onSave, nextScheduleContext, onClearNextPrompt, onCreateNext }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [feedback, setFeedback] = useState(schedule.feedback || { positive: '', improvement: '', ideas: '' });
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    useEffect(() => {
        if (nextScheduleContext && nextScheduleContext.id === schedule.id) {
          setTimeout(() => {
            const userAgrees = window.confirm(`Sugestão para a próxima aula: "${schedule.nextClassSuggestion}"\n\nDeseja criar a próxima aula agora?`);
            if (userAgrees) {
              onCreateNext(schedule.nextClassSuggestion);
            }
            onClearNextPrompt();
          }, 100);
        }
    }, [nextScheduleContext, schedule.id, schedule.nextClassSuggestion, onCreateNext, onClearNextPrompt]);

    const handleSaveFeedback = () => {
        const updatedSchedule = { ...schedule, feedback };
        onSave(updatedSchedule);
        setFeedbackMessage('Feedback salvo com sucesso!');
        setTimeout(() => setFeedbackMessage(null), 3000);
    };
    
    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este cronograma?')) {
            onDelete(schedule.id);
        }
    };
    
    const handleDownload = () => {
        generatePdf(schedule);
    };

    const handleSaveFromEdit = (editedSchedule: Schedule) => {
        onSave(editedSchedule);
        setIsEditing(false);
    };

    if (isEditing) {
        return <ScheduleForm onSave={handleSaveFromEdit} onCancel={() => setIsEditing(false)} existingSchedule={schedule} initialContext={null} feedbackContext={''} onFormReady={() => {}} />;
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                <div>
                    <button onClick={onBack} className="btn btn-secondary" style={{marginBottom: '1rem'}}>&larr; Voltar para o Histórico</button>
                    <h2 style={{fontSize: '2rem', color: 'var(--accent-orange)'}}>{schedule.title}</h2>
                    <div style={{display: 'flex', gap: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem', flexWrap: 'wrap'}}>
                        <span>Data: {new Date(schedule.classDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        <span>Público: {schedule.targetAudience}</span>
                        <span>Clima: {schedule.weatherCondition}</span>
                    </div>
                </div>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary"><EditIcon /> Editar</button>
                    <button onClick={handleDelete} className="btn" style={{backgroundColor: 'var(--danger-color)', color: '#fff'}}><TrashIcon /> Excluir</button>
                    <button onClick={handleDownload} className="btn btn-primary"><DownloadIcon /> Baixar PDF</button>
                </div>
            </div>

            <div className="content-card" style={{padding: '1.5rem 2rem'}}>
                <h3 style={{fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem'}}>Detalhes da Aula</h3>
                <div>
                    <h4 style={{fontWeight: 600}}>Tema Principal:</h4>
                    <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>{schedule.theme}</p>
                </div>
                <div style={{marginTop: '1rem'}}>
                    <h4 style={{fontWeight: 600}}>Objetivos Pedagógicos:</h4>
                    <p style={{color: 'var(--text-secondary)', marginTop: '0.25rem'}}>{schedule.objectives}</p>
                </div>
            </div>

            <div style={{overflowX: 'auto'}}>
                 <table className="custom-table">
                    <thead>
                        <tr>
                          <th>Horário</th>
                          <th>Atividade</th>
                          <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.activities.map((act, index) => (
                        <tr key={index}>
                            <td style={{fontWeight: 500, color: 'var(--text-primary)'}}>{act.time}</td>
                            <td style={{color: 'var(--accent-orange)', fontWeight: 600}}>{act.activity}</td>
                            <td>{act.description}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="content-card" style={{padding: '1.5rem 2rem'}}>
                <h3 style={{fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem'}}>Gancho para a Próxima Aula</h3>
                <p style={{color: 'var(--text-secondary)'}}>{schedule.nextClassSuggestion}</p>
            </div>

            <div className="content-card" style={{padding: '1.5rem 2rem'}}>
                <h3 style={{fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem'}}>Feedback da Aula (para aprendizado da IA)</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div>
                        <label htmlFor="positive" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--success-color)', marginBottom: '0.25rem'}}>Pontos Positivos</label>
                        <textarea id="positive" rows={3} value={feedback.positive} onChange={(e) => setFeedback({...feedback, positive: e.target.value})} placeholder="O que funcionou muito bem nesta aula?" className="form-textarea"/>
                    </div>
                     <div>
                        <label htmlFor="improvement" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--warning-color)', marginBottom: '0.25rem'}}>Pontos de Melhoria</label>
                        <textarea id="improvement" rows={3} value={feedback.improvement} onChange={(e) => setFeedback({...feedback, improvement: e.target.value})} placeholder="O que poderia ser melhorado para a próxima vez?" className="form-textarea"/>
                    </div>
                     <div>
                        <label htmlFor="ideas" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--info-color)', marginBottom: '0.25rem'}}>Novas Ideias</label>
                        <textarea id="ideas" rows={3} value={feedback.ideas} onChange={(e) => setFeedback({...feedback, ideas: e.target.value})} placeholder="Surgiram novas ideias ou sugestões dos alunos?" className="form-textarea"/>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem'}}>
                        {feedbackMessage && (
                            <p style={{color: 'var(--success-color)'}}>
                                {feedbackMessage}
                            </p>
                        )}
                        <button onClick={handleSaveFeedback} className="btn btn-primary">Salvar Feedback</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetail;