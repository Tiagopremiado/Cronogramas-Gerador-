import { WeatherCondition } from '../types';

/**
 * Simulates fetching weather for a specific date and city.
 * In a real application, this would call a real weather API.
 * @param date The date in YYYY-MM-DD format.
 * @param city The city for the forecast.
 * @returns A promise that resolves to a WeatherCondition.
 */
export const fetchWeatherForDate = async (date: string, city: string): Promise<WeatherCondition> => {
    console.log(`Simulating weather fetch for ${city} on ${date}`);
    
    // Add 'T12:00:00Z' to avoid timezone issues when parsing the date string.
    const dayOfMonth = new Date(date + 'T12:00:00Z').getDate();

    // Simple mock logic: use the day of the month to pseudo-randomly determine the weather.
    const conditionMap = {
        0: WeatherCondition.Rainy,
        1: WeatherCondition.Cloudy,
        2: WeatherCondition.Sunny,
    };
    
    const condition = conditionMap[dayOfMonth % 3 as keyof typeof conditionMap];

    // Simulate network delay to mimic a real API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(condition);
        }, 800);
    });
};
