import { apiClient } from './api-client';
import { 
  API_ENDPOINTS, 
  ApiSuccess, 
  AutomationStatus, 
  AutomationConfig 
} from '../types/api.types';

export class AutomationService {
  private static instance: AutomationService;

  private constructor() {}

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  public async startAutomation(config: AutomationConfig): Promise<string> {
    const response = await apiClient.post<ApiSuccess<{ id: string }>>(
      API_ENDPOINTS.AUTOMATION.START,
      config
    );
    return response.data.id;
  }

  public async getAutomationStatus(id: string): Promise<AutomationStatus> {
    const response = await apiClient.get<ApiSuccess<AutomationStatus>>(
      API_ENDPOINTS.AUTOMATION.STATUS(id)
    );
    return response.data;
  }

  public async pauseAutomation(id: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.AUTOMATION.PAUSE(id));
  }

  public async resumeAutomation(id: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.AUTOMATION.RESUME(id));
  }

  public async stopAutomation(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.AUTOMATION.STOP(id));
  }

  public async getActiveAutomations(): Promise<AutomationStatus[]> {
    const response = await apiClient.get<ApiSuccess<AutomationStatus[]>>(
      API_ENDPOINTS.AUTOMATION.START
    );
    return response.data;
  }

  // Helper method to poll automation status
  public pollAutomationStatus(
    id: string,
    onUpdate: (status: AutomationStatus) => void,
    interval = 5000
  ): () => void {
    const pollId = setInterval(async () => {
      try {
        const status = await this.getAutomationStatus(id);
        onUpdate(status);

        // Stop polling if automation is complete or failed
        if (['completed', 'failed', 'stopped'].includes(status.status)) {
          clearInterval(pollId);
        }
      } catch (error) {
        console.error('Error polling automation status:', error);
        clearInterval(pollId);
      }
    }, interval);

    // Return cleanup function
    return () => clearInterval(pollId);
  }
}

export const automationService = AutomationService.getInstance();
