import React, { useState, useEffect } from 'react';
import { Schedule } from './types';
import Header from './components/Header';
import ScheduleList from './components/ScheduleList';
import ScheduleDetail from './components/ScheduleDetail';
import ScheduleForm from './components/ScheduleForm';
import FeedbackHistory from './components/FeedbackHistory';
import LessonAnalyzer from './components/LessonAnalyzer'; // Importa o novo componente
import { downloadJson, readFileAsText } from './utils';

const App: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isViewingFeedback, setIsViewingFeedback] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // Novo estado para controlar a tela de análise
  const [showNextClassPrompt, setShowNextClassPrompt] = useState<Schedule | null>(null);
  const [initialCreationContext, setInitialCreationContext] = useState<string | null>(null);
  const [feedbackForAI, setFeedbackForAI] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedSchedules = localStorage.getItem('fopeSchedules');
      if (savedSchedules) {
        setSchedules(JSON.parse(savedSchedules));
      }
    } catch (error: any) {
      console.error("Failed to load schedules from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fopeSchedules', JSON.stringify(schedules));
    } catch (error: any) {
      console.error("Failed to save schedules to localStorage", error);
    }
  }, [schedules]);

  const prepareFeedbackForAI = () => {
    const relevantSchedules = schedules.filter(s => 
        s.feedback && (s.feedback.positive || s.feedback.improvement || s.feedback.ideas)
    ).slice(-5);

    if (relevantSchedules.length === 0) return '';
    
    const feedbackText = relevantSchedules.map(s => `
---
### Feedback da Aula: "${s.title}" (${new Date(s.classDate + 'T00:00:00').toLocaleDateString('pt-BR')})
**- Pontos Positivos:** ${s.feedback.positive || 'Nenhum registrado.'}
**- Pontos de Melhoria:** ${s.feedback.improvement || 'Nenhum registrado.'}
**- Novas Ideias:** ${s.feedback.ideas || 'Nenhuma registrada.'}
---
    `).join('\n');
    
    return feedbackText;
  };

  const handleSaveSchedule = (schedule: Schedule) => {
    const isNew = !schedules.some(s => s.id === schedule.id);
    const existingIndex = schedules.findIndex(s => s.id === schedule.id);
    if (existingIndex > -1) {
      const updatedSchedules = [...schedules];
      updatedSchedules[existingIndex] = schedule;
      setSchedules(updatedSchedules);
    } else {
      setSchedules(prevSchedules => [...prevSchedules, schedule]);
    }
    
    if (isNew) {
      setShowNextClassPrompt(schedule);
    }
    
    setHasUnsavedChanges(true);
    setIsCreating(false);
    setSelectedSchedule(schedule);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    setHasUnsavedChanges(true);
    if (selectedSchedule?.id === id) {
      setSelectedSchedule(null);
    }
  };

  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsCreating(false);
  };

  const handleBackToList = () => {
    setSelectedSchedule(null);
    setIsCreating(false);
    setIsViewingFeedback(false);
    setIsAnalyzing(false); // Garante que a tela de análise seja fechada
  };

  const handleCreateNew = () => {
    setSelectedSchedule(null);
    setFeedbackForAI(prepareFeedbackForAI());
    setIsCreating(true);
  }
  
  const handleViewFeedback = () => {
    setIsViewingFeedback(true);
  };

  // Nova função para abrir o analisador
  const handleAnalyzeLesson = () => {
    setIsAnalyzing(true);
  };
  
  // Função para criar aula a partir de um contexto (usado pelo analisador)
  const handleCreateFromContext = (context: string) => {
    setInitialCreationContext(context);
    setIsAnalyzing(false);
    handleCreateNew();
  };

  const handleCreateNext = (suggestion: string) => {
    setShowNextClassPrompt(null);
    setInitialCreationContext(suggestion);
    handleCreateNew();
  };
  
  const handleBackup = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadJson(schedules, `fope_backup_${date}.json`);
    setHasUnsavedChanges(false);
  };

  const handleRestore = async (file: File) => {
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const restoredSchedules = JSON.parse(text);
      if (Array.isArray(restoredSchedules)) {
        setSchedules(restoredSchedules);
        setHasUnsavedChanges(false); // Backup restaurado está "salvo"
        alert('Backup restaurado com sucesso!');
      } else {
        throw new Error('Formato de backup inválido.');
      }
    } catch (error: any) {
      console.error("Failed to restore backup", error);
      alert('Erro ao restaurar o backup. Verifique o arquivo.');
    }
  };

  const renderContent = () => {
    if (isAnalyzing) {
      return <LessonAnalyzer onBack={handleBackToList} onCreate={handleCreateFromContext} />;
    }
    if (isViewingFeedback) {
      return <FeedbackHistory schedules={schedules} onBack={handleBackToList} />;
    }
    if (isCreating) {
      return (
        <ScheduleForm 
          onSave={handleSaveSchedule} 
          onCancel={handleBackToList} 
          existingSchedule={null}
          initialContext={initialCreationContext}
          feedbackContext={feedbackForAI}
          onFormReady={() => setInitialCreationContext(null)}
        />
      );
    }
    if (selectedSchedule) {
      return (
        <ScheduleDetail 
          schedule={selectedSchedule} 
          onBack={handleBackToList}
          onDelete={handleDeleteSchedule}
          onSave={handleSaveSchedule}
          nextScheduleContext={showNextClassPrompt}
          onClearNextPrompt={() => setShowNextClassPrompt(null)}
          onCreateNext={handleCreateNext}
        />
      );
    }
    return (
      <ScheduleList 
        schedules={schedules} 
        onSelectSchedule={handleSelectSchedule} 
        onCreateNew={handleCreateNew} 
        onBackup={handleBackup}
        onRestore={handleRestore}
        onViewFeedback={handleViewFeedback}
        onAnalyzeLesson={handleAnalyzeLesson} // Passa a nova função para o ScheduleList
        hasUnsavedChanges={hasUnsavedChanges}
      />
    );
  };

  return (
    <div style={{minHeight: '100vh'}}>
      <Header />
      <main className="container" style={{paddingTop: '2rem', paddingBottom: '2rem'}}>
        {renderContent()}
      </main>
      <footer style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.875rem'}}>
        <p>&copy; {new Date().getFullYear()} FOPE Cia 126 Pedro Osório RS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;