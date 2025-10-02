export enum TargetAudience {
  Kids = 'Kids (10-13 anos)',
  Juvenil = 'Juvenil (14-17 anos)',
  Combined = 'Turmas Combinadas',
}

export enum WeatherCondition {
  Sunny = 'Ensolarado',
  Cloudy = 'Nublado',
  Rainy = 'Chuvoso',
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
}

export interface Schedule {
  id: string;
  title: string;
  targetAudience: TargetAudience;
  theme: string;
  objectives: string;
  activities: Activity[];
  nextClassSuggestion: string;
  feedback: {
    positive: string;
    improvement: string;
    ideas: string;
  };
  classDate: string; // YYYY-MM-DD
  weatherCondition: WeatherCondition;
}
