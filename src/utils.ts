import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as pdfjsLib from 'pdfjs-dist';
import { Schedule, Activity } from './types';

// O worker é necessário para o pdf.js funcionar.
// Vite irá empacotar o worker automaticamente, então podemos usar um import para obter a URL.
// @ts-ignore
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorker;

export const generatePdf = (schedule: Schedule) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Plano de Aula FOPE', 14, 22);
  doc.setFontSize(12);
  doc.text(`Cronograma: ${schedule.title}`, 14, 32);

  // Info section
  doc.setFontSize(10);
  doc.text(`Data: ${new Date(schedule.classDate + 'T00:00:00').toLocaleDateString('pt-BR')}`, 14, 40);
  doc.text(`Público: ${schedule.targetAudience}`, 14, 45);
  doc.text(`Clima Previsto: ${schedule.weatherCondition}`, 14, 50);

  // Theme and Objectives
  doc.setFontSize(12);
  doc.text('Tema Principal:', 14, 60);
  doc.setFontSize(10);
  let finalY = doc.splitTextToSize(schedule.theme, 180).length * 5 + 65;
  doc.text(doc.splitTextToSize(schedule.theme, 180), 14, 65);
  
  doc.setFontSize(12);
  finalY += 5;
  doc.text('Objetivos Pedagógicos:', 14, finalY);
  doc.setFontSize(10);
  finalY += 5;
  doc.text(doc.splitTextToSize(schedule.objectives, 180), 14, finalY);
  
  // Activities Table
  const tableData = schedule.activities.map((act: Activity) => [act.time, act.activity, act.description]);
  
  autoTable(doc, {
    startY: finalY + 10,
    head: [['Horário', 'Atividade', 'Descrição']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [255, 193, 7], textColor: [40, 40, 40] },
    styles: {
        font: 'helvetica',
        fontSize: 10
    }
  });

  // Next class suggestion
  // The plugin adds `lastAutoTable` to the doc object after a table is drawn
  const suggestionY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text('Sugestão para a Próxima Aula:', 14, suggestionY);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(schedule.nextClassSuggestion, 180), 14, suggestionY + 5);

  doc.save(`${schedule.title.replace(/\s+/g, '_')}.pdf`);
};

export const downloadJson = (data: any, filename: string) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement('a');
  link.href = jsonString;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const readPdfAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                if (!event.target?.result) {
                    return reject(new Error("Falha ao ler o arquivo."));
                }
                const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
                }
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};