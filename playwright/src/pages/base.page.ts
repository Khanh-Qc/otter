export class BasePage {
    protected async getRequest(url: string) {
      const response = await fetch(url);
      return response.json();
    }
  
    protected async postRequest(url: string, data: any) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    }
  }
  