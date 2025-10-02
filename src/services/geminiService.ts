import { GoogleGenAI, Type } from "@google/genai";
import { TargetAudience, Activity, WeatherCondition } from '../types';

// Fix: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to align with the coding guidelines.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateScheduleParams {
    target: TargetAudience;
    date: string;
    weather: WeatherCondition;
    theme?: string;
    objectives?: string;
    contextPrompt?: string;
    pastFeedback?: string;
}

interface GeminiResponse {
    theme?: string;
    objectives?: string;
    schedule: Activity[];
    nextClassSuggestion: string;
}

const FOPE_KNOWLEDGE_BASE = `
**Base de Conhecimento FOPE:**
Use esta base de conhecimento, extraída de materiais de treinamento reais da FOPE, para criar cronogramas autênticos, detalhados e criativos. As atividades propostas DEVEM, sempre que possível, se basear nos exemplos abaixo.

**1. TÉCNICAS DE SOBREVIVÊNCIA:**
*   **Alimentação:**
    *   **Nível Iniciante:** Identificação de alimentos seguros (plantas, frutas), higiene no preparo.
    *   **Nível Avançado:** Técnicas de caça e pesca (armadilhas simples), cozinhar arroz em gomos de bambu, cozinhar carne moída em cascas de laranja.
*   **Fogo:** Técnicas de acendimento sem fósforos (pederneira e striker, bateria 9V e bombril). Demonstração de segurança com materiais inflamáveis.
*   **Abrigos Improvisados:**
    *   **Tipos:** Rabo de Jacu (estrutura simples com cobertura de folhas), Rabo de Mutum (abrigo suspenso com rede), Tapiri (estrutura robusta), Abrigos Suspensos (para proteção contra umidade e animais).
    *   **Materiais:** Cordas, lonas, estacas, folhas grandes, galhos.
*   **Primeiros Socorros:**
    *   **Básico:** RCP, controle de hemorragias, tratamento de queimaduras, picadas, fraturas, entorses.
    *   **Afogamento:** Cadeira de sobrevivência, fornecimento de flutuação, remoção segura da água.
*   **Manutenção dos Pés:** Importância, montagem de kit (permanganato de potássio, cutisanol, agulha esterilizada, etc.).

**2. TÉCNICAS MILITARES E TÁTICAS:**
*   **Camuflagem:**
    *   **Teoria:** História, tipos de uniformes (Woodland, Deserto Digital), diferença entre ocultação e engano.
    *   **Prática:** Pintura facial (tons de verde, preto, marrom), uso de elementos naturais (folhagens, lama).
*   **Nós e Amarras:**
    *   **Nós Essenciais:** Nó direito, volta do fiel, nó de frade, amarra quadrada.
    *   **Aplicações:** Construção de mini-pontes, montagem de barracas, criação de alças, simulação de "Resgate na Selva" com maca improvisada.
*   **Orientação:**
    *   **Bússola:** Uso básico e avançado (com mapa, declinação magnética).
    *   **Métodos Naturais:** Orientação pelo sol, pelas estrelas (Cruzeiro do Sul, Estrela Polar).
*   **Transposição por Cordas:** Falsa baiana, preguiça, Comando Craw. Foco em segurança e trabalho em equipe.
*   **Pista de Obstáculos (Pista Fio):** Foco em habilidades sensoriais.
    *   **Obstáculos:** Rastejar sob fios (Fio Baixo), Túnel Táctil (texturas), Caminho Cego (vendado, guiado por corda), Desafio Sonoro.
*   **Defesa Pessoal:**
    *   **Aula 1:** Socos e Chutes.
    *   **Aula 2:** Pegadas e Torções.
    *   **Aula 3:** Quedas e Rasteiras (Judô, Jiu-Jitsu).
    *   **Aula 4:** Desarmes (armas de fogo e facas).
*   **Rastreamento:** Identificação de sinais (pegadas, marcas), aplicação de primeiros socorros em cenários de resgate.
*   **Tropa de Choque:** Formações de contenção de multidões (cunha, escalão), confecção de escudos artesanais para treinamento.
*   **Ordem Unida:** Cerimônias como "Apresentar Armas".

**3. COMPETIÇÕES E DINÂMICAS:**
*   A 7ª aula de um ciclo pode ser uma grande competição, testando as 6 aulas anteriores.
*   Dividir alunos em equipes para desafios de tempo e qualidade. Exemplos: camuflar integrantes, fazer nós específicos, percurso em pista de obstáculos, acender fogo, montar abrigo.
`;


export const generateScheduleWithAI = async ({ target, theme, objectives, date, weather, contextPrompt, pastFeedback }: GenerateScheduleParams): Promise<GeminiResponse> => {
    const isFullGeneration = !theme || !objectives;
    const duration = (target === TargetAudience.Kids || target === TargetAudience.Juvenil) ? 2 : 3;
    
    const feedbackPromptSection = pastFeedback
        ? `
**FEEDBACK DE AULAS ANTERIORES PARA APRENDIZADO:**
Analise os seguintes feedbacks de aulas passadas para refinar suas sugestões. Aprenda com os pontos positivos para replicar o sucesso e preste muita atenção nos pontos de melhoria para evitar repetir erros. Use as 'ideias' como fonte de inspiração.
${pastFeedback}
`
        : '';
        
    const contextPromptSection = contextPrompt
        ? `
**CONTEXTO IMPORTANTE:**
A aula anterior terminou com a seguinte sugestão, ou foi fornecido o seguinte conteúdo sobre a aula anterior. Use esta informação como inspiração principal para criar o tema e os objetivos desta nova aula, garantindo uma progressão contínua e coerente.
Conteúdo/Sugestão: "${contextPrompt}"
` : '';

    const baseRules = `
    **Regras CRÍTICAS:**
    1.  **USO DA BASE DE CONHECIMENTO:** A regra mais importante é utilizar a "Base de Conhecimento FOPE" fornecida para inspirar e detalhar as atividades. Os cronogramas devem ser realistas e alinhados com as práticas descritas.
    1.5. **APRENDIZADO CONTÍNUO:** Se um feedback for fornecido, use-o para informar suas decisões, melhorando a qualidade das atividades e evitando repetir os 'pontos de melhoria'.
    2.  **ADAPTAÇÃO AO CLIMA:** Adapte o cronograma à previsão do tempo.
        *   Se o tempo for 'Chuvoso', TODAS as atividades DEVEM ser adequadas para um ambiente INTERNO (sala de aula, ginásio). Exemplos da base de conhecimento: nós e amarrações, primeiros socorros, defesa pessoal em tatame, teoria de orientação, ordem unida em local coberto.
        *   Se o tempo for 'Ensolarado' ou 'Nublado', atividades ao ar livre são preferíveis. Exemplos da base de conhecimento: camuflagem na mata, construção de abrigos, pista de obstáculos.
    3.  **RELEVÂNCIA DA DATA:** Considere a data da aula para sugerir atividades sazonais ou contextuais, se aplicável (ex: temas cívicos perto de feriados nacionais no Brasil).
    4.  **PROGRESSÃO LÓGICA:** O cronograma deve ser progressivo, com uma atividade levando logicamente à próxima.
    5.  **FAIXA ETÁRIA:** As atividades devem ser apropriadas para a faixa etária do público-alvo.
        *   'Kids' (10-13 anos): atividades mais lúdicas e curtas.
        *   'Juvenil' (14-17 anos): atividades mais técnicas e desafiadoras.
    6.  **ESTRUTURA OBRIGATÓRIA:** Siga esta estrutura, adaptando o conteúdo de cada seção ao tema, clima e base de conhecimento:
        *   **Formação e Cerimonial:** (ex: formatura, oração, brado, lema)
        *   **Atividade Física / Condicionamento:** (adaptada para indoor/outdoor)
        *   **Instrução Técnica / Teórica:** (O núcleo da aula, baseado na Base de Conhecimento)
        *   **Dinâmica Competitiva / Simulação:** (Uma atividade prática baseada na instrução, adaptada para indoor/outdoor)
        *   **Encerramento:** (ex: revisão, recados, brado final)
    7.  **GANCHO PARA A PRÓXIMA AULA:** Crie uma sugestão criativa para a próxima aula que se baseie nesta.
    8.  **FORMATO:** A resposta DEVE ser um objeto JSON que corresponda ao esquema fornecido. O idioma deve ser Português do Brasil.
    `;

    const prompt = isFullGeneration
        ? `
        Você é um designer instrucional especialista para a organização juvenil pré-militar brasileira chamada FOPE. Sua tarefa é ser criativo e gerar um **tema**, **objetivos pedagógicos**, e um **cronograma de aula completo** do zero, com base nos parâmetros fornecidos, na Base de Conhecimento FOPE e nos feedbacks de aulas anteriores.
        
        ${FOPE_KNOWLEDGE_BASE}
        ${feedbackPromptSection}
        ${contextPromptSection}

        Primeiro, crie um tema principal e objetivos pedagógicos que sejam interessantes, relevantes e apropriados para os parâmetros de entrada, baseando-se fortemente na Base de Conhecimento.

        ${baseRules}

        **Parâmetros de Entrada:**
        *   **Público-alvo:** ${target}
        *   **Duração da Aula:** ${duration} horas
        *   **Data da Aula:** ${date}
        *   **Previsão do Tempo:** ${weather}
        `
        : `
        Você é um designer instrucional especialista para uma organização juvenil pré-militar brasileira chamada FOPE. Sua tarefa é criar um cronograma de aula detalhado com base nos parâmetros fornecidos, na Base de Conhecimento FOPE e nos feedbacks de aulas anteriores.

        ${FOPE_KNOWLEDGE_BASE}
        ${feedbackPromptSection}
        
        ${baseRules}

        **Parâmetros de Entrada:**
        *   **Público-alvo:** ${target}
        *   **Duração da Aula:** ${duration} horas
        *   **Tema Principal:** ${theme}
        *   **Objetivos Pedagógicos:** ${objectives}
        *   **Data da Aula:** ${date}
        *   **Previsão do Tempo:** ${weather}
        `;

    const scheduleProperty = {
        type: Type.ARRAY,
        description: "A lista de atividades para o cronograma da aula.",
        items: {
            type: Type.OBJECT,
            properties: {
                time: { type: Type.STRING, description: "Intervalo de tempo da atividade (e.g., '14:00 – 14:10')." },
                activity: { type: Type.STRING, description: "O nome da atividade (e.g., 'Formação e Cerimonial')." },
                description: { type: Type.STRING, description: "Uma breve descrição do que será feito na atividade." }
            },
            required: ["time", "activity", "description"]
        }
    };
    
    const nextClassSuggestionProperty = {
        type: Type.STRING,
        description: "Uma sugestão para a próxima aula para dar continuidade ao aprendizado."
    };

    const schema = isFullGeneration
        ? {
            type: Type.OBJECT,
            properties: {
                theme: { type: Type.STRING, description: "O tema principal da aula, gerado pela IA." },
                objectives: { type: Type.STRING, description: "Os objetivos pedagógicos da aula, gerados pela IA." },
                schedule: scheduleProperty,
                nextClassSuggestion: nextClassSuggestionProperty
            },
            required: ["theme", "objectives", "schedule", "nextClassSuggestion"]
        }
        : {
            type: Type.OBJECT,
            properties: {
                schedule: scheduleProperty,
                nextClassSuggestion: nextClassSuggestionProperty
            },
            required: ["schedule", "nextClassSuggestion"]
        };
        
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text;
        if (!jsonText) {
          throw new Error("API returned an empty response.");
        }

        const parsedResponse: GeminiResponse = JSON.parse(jsonText);
        return parsedResponse;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Falha ao gerar o cronograma com a IA. Por favor, tente novamente.");
    }
};

export const analyzeLessonAndSuggestNext = async (lessonContent: string): Promise<string> => {
    const prompt = `
    Você é um assistente pedagógico da FOPE. Sua tarefa é analisar o conteúdo de um plano de aula anterior e, com base nele, criar uma sugestão (um "gancho") para a próxima aula que seja uma continuação lógica e criativa.

    **Plano de Aula Anterior para Análise:**
    ---
    ${lessonContent}
    ---

    **Sua Resposta:**
    Analise o tema, os objetivos e as atividades acima. Crie uma única frase ou um parágrafo curto que sirva como uma sugestão clara e inspiradora para o tema da PRÓXIMA aula.
    Por exemplo, se a aula foi sobre "Nós e Amarrações Básicas", uma boa sugestão seria: "Agora que dominamos os nós essenciais, vamos aplicá-los na construção de abrigos improvisados na próxima aula.".
    A resposta deve ser APENAS a sugestão, sem frases como "Aqui está sua sugestão:".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text;
        if (!text) {
          throw new Error("A IA não retornou uma sugestão.");
        }
        return text.trim();

    } catch (error) {
        console.error("Error calling Gemini API for analysis:", error);
        throw new Error("Falha ao analisar o plano de aula com a IA. Por favor, tente novamente.");
    }
};