class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async fetchData(endpoint: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/${endpoint}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    async postData(endpoint: string, data: any): Promise<any> {
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
}

export default ApiService;