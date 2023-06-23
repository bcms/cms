import { BCMSRepo } from '@backend/repo';

export class BCMSApiKeyService {
  static async updateTemplateName(data: {
    templateId: string;
    name: string;
  }): Promise<void> {
    const apiKeys = await BCMSRepo.apiKey.findAll();
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      const accessIndex = apiKey.access.templates.findIndex(
        (e) => e._id === data.templateId,
      );
      if (accessIndex !== -1) {
        apiKey.access.templates[accessIndex].name = data.name;
        await BCMSRepo.apiKey.update(apiKey);
      }
    }
  }
}
