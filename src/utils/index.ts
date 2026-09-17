export const formatDate = (date: Date, format: string): string => {
    const options: Intl.DateTimeFormatOptions = {};
    
    if (format.includes('year')) {
        options.year = 'numeric';
    }
    if (format.includes('month')) {
        options.month = 'long';
    }
    if (format.includes('day')) {
        options.day = 'numeric';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const calculateSum = (numbers: number[]): number => {
    return numbers.reduce((acc, curr) => acc + curr, 0);
};

export const generateRandomId = (length: number): string => {
    return Math.random().toString(36).substr(2, length);
};