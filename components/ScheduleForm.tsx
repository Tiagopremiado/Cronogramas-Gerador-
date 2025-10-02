import React, { useState, useEffect } from 'react';
import { Schedule, Activity, TargetAudience, WeatherCondition } from '../types';
import { generateScheduleWithAI } from '../services/geminiService';
import { fetchWeatherForDate } from '../services/weatherService';
import { generatePdf } from '../utils';

interface ScheduleFormProps {
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
  existingSchedule: Schedule | null;
  initialContext: string | null;
  feedbackContext: string;
  onFormReady: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onSave, onCancel, existingSchedule, initialContext, feedbackContext, onFormReady }) => {
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(TargetAudience.Juvenil);
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>(WeatherCondition.Sunny);
  const [theme, setTheme] = useState('');
  const [objectives, setObjectives] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [nextClassSuggestion, setNextClassSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    if (existingSchedule) {
      setTitle(existingSchedule.title);
      setTargetAudience(existingSchedule.targetAudience);
      setTheme(existingSchedule.theme);
      setObjectives(existingSchedule.objectives);
      setActivities(existingSchedule.activities);
      setNextClassSuggestion(existingSchedule.nextClassSuggestion);
      setClassDate(existingSchedule.classDate);
      setWeatherCondition(existingSchedule.weatherCondition);
    }
  }, [existingSchedule]);
  
  useEffect(() => {
    const fetchWeather = async () => {
        setIsFetchingWeather(true);
        setWeatherError(null);
        try {
            const weather = await fetchWeatherForDate(classDate, 'Pedro Osório, RS');
            setWeatherCondition(weather);
        } catch (error) {
            setWeatherError('Falha ao buscar clima.');
            setWeatherCondition(WeatherCondition.Cloudy);
        } finally {
            setIsFetchingWeather(false);
        }
    };

    if (classDate) {
        fetchWeather();
    }
  }, [classDate]);

  useEffect(() => {
    const generateFromContext = async () => {
      if (initialContext) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await generateScheduleWithAI({ 
            target: targetAudience, 
            date: classDate, 
            weather: weatherCondition,
            contextPrompt: initialContext,
            pastFeedback: feedbackContext,
          });
          setTheme(response.theme || '');
          setTitle(response.theme || `Aula de ${new Date(classDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}`);
          setObjectives(response.objectives || '');
          setActivities(response.schedule);
          setNextClassSuggestion(response.nextClassSuggestion);
        } catch (err: any) {
          setError(err.message || "Ocorreu um erro ao gerar a sugestão completa.");
        } finally {
          setIsLoading(false);
          onFormReady();
        }
      }
    };
    generateFromContext();
  }, [initialContext, classDate, targetAudience, weatherCondition, onFormReady, feedbackContext]);


  const handleGenerateActivities = async () => {
    if (!theme || !objectives) {
      setError("Por favor, preencha o Tema e os Objetivos para gerar as atividades.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateScheduleWithAI({ target: targetAudience, theme, objectives, date: classDate, weather: weatherCondition, pastFeedback: feedbackContext });
      setActivities(response.schedule);
      setNextClassSuggestion(response.nextClassSuggestion);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao gerar o cronograma.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFullSuggestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateScheduleWithAI({ 
          target: targetAudience, 
          date: classDate, 
          weather: weatherCondition,
          pastFeedback: feedbackContext,
        });
      setTheme(response.theme || '');
      setTitle(response.theme || `Aula de ${new Date(classDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}`);
      setObjectives(response.objectives || '');
      setActivities(response.schedule);
      setNextClassSuggestion(response.nextClassSuggestion);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao gerar a sugestão completa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!title) {
        setError("O título do cronograma é obrigatório.");
        return;
    }
    const newSchedule: Schedule = {
      id: existingSchedule?.id || new Date().toISOString(),
      title,
      targetAudience,
      theme,
      objectives,
      activities,
      nextClassSuggestion,
      feedback: existingSchedule?.feedback || { positive: '', improvement: '', ideas: '' },
      classDate,
      weatherCondition,
    };
    onSave(newSchedule);
    generatePdf(newSchedule);
  };

  return (
    <div className="content-card" style={{padding: '1.5rem 2rem'}}>
      <h2 style={{fontSize: '1.8rem', color: 'var(--accent-orange)', marginBottom: '1.5rem'}}>
        {existingSchedule ? 'Editar Cronograma' : 'Criar Novo Cronograma'}
      </h2>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
          <div>
            <label htmlFor="title" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Título</label>
            <input
              type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinamento de Nós e Amarrações"
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="classDate" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Data da Aula</label>
            <input type="date" id="classDate" value={classDate} onChange={(e) => setClassDate(e.target.value)} className="form-input" />
          </div>
          <div>
            <label htmlFor="targetAudience" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Público-Alvo</label>
            <select id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as TargetAudience)} className="form-select">
              {Object.values(TargetAudience).map(audience => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Previsão do Tempo</label>
            <div className="form-input" style={{height: '46px', display: 'flex', alignItems: 'center'}}>
                {isFetchingWeather ? (
                    <span style={{color: 'var(--text-secondary)'}}>Buscando...</span>
                ) : weatherError ? (
                    <span style={{color: 'var(--danger-color)'}}>{weatherError}</span>
                ) : (
                    <span>{weatherCondition}</span>
                )}
            </div>
          </div>
        </div>

        <div className="content-card" style={{padding: '1.5rem', border: '1px solid var(--input-border)'}}>
          <h3 style={{fontSize: '1.25rem', color: 'var(--accent-orange)', marginBottom: '1rem'}}>Gerar com IA</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
                <label htmlFor="theme" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Tema Principal</label>
                <input type="text" id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: Resgate em corda (ou deixe a IA sugerir)" className="form-input"/>
            </div>
            <div>
                <label htmlFor="objectives" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Objetivos Pedagógicos</label>
                <textarea id="objectives" rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="Ex: Ensinar a montar e utilizar cadeirinha (ou deixe a IA sugerir)" className="form-textarea"/>
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem'}}>
                <button onClick={handleGenerateFullSuggestion} disabled={isLoading} className="btn btn-secondary">
                    {isLoading ? 'Gerando...' : 'Sugestão Completa da IA'}
                </button>
                <button onClick={handleGenerateActivities} disabled={isLoading || !theme || !objectives} className="btn btn-primary">
                    {isLoading ? 'Gerando...' : 'Gerar Atividades'}
                </button>
            </div>
          </div>
        </div>

        {error && <p style={{color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px'}}>{error}</p>}
        
        { (activities.length > 0 || isLoading) && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <h3 style={{fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '1rem'}}>Atividades Sugeridas</h3>
                {isLoading ? (
                    <div style={{textAlign: 'center', padding: '2rem'}}>
                        <div role="status" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <svg aria-hidden="true" style={{width: '2.5rem', height: '2.5rem', color: 'var(--text-secondary)', animation: 'spin 1s linear infinite', fill: 'var(--accent-orange)'}} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                        </div>
                        <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>Aguarde, a IA está montando o plano de aula perfeito...</p>
                    </div>
                ) : (
                    <>
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
                                {activities.map((act, index) => (
                                <tr key={index}>
                                    <td style={{fontWeight: 500, color: 'var(--text-primary)'}}>{act.time}</td>
                                    <td style={{color: 'var(--accent-orange)', fontWeight: 600}}>{act.activity}</td>
                                    <td>{act.description}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4 style={{fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem'}}>Sugestão para a próxima aula:</h4>
                        <p className="content-card" style={{padding: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)'}}>{nextClassSuggestion}</p>
                    </div>
                    </>
                )}
            </div>
        )}
      </div>
      
      <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <button onClick={onCancel} className="btn btn-secondary">
          Voltar para o Histórico
        </button>
        <button onClick={handleSave} disabled={activities.length === 0} className="btn" style={{backgroundColor: 'var(--success-color)', color: '#fff'}}>
          Salvar e Baixar PDF
        </button>
      </div>
    </div>
  );
};

export default ScheduleForm;