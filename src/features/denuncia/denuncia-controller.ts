import { DenunciaService } from './denuncia-service';
import {
  ComplaintDraft,
  CouncilRegion,
  PublicForm,
  PublicProfession,
} from './types/denuncia';

export type DenunciaState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  protocol?: string;
};

export class DenunciaController {
  private service: DenunciaService;

  constructor() {
    this.service = new DenunciaService();
  }

  async listPublicProfessions(): Promise<PublicProfession[]> {
    return this.service.listPublicProfessions();
  }

  async getPublicForm(professionId: number): Promise<PublicForm> {
    return this.service.getPublicForm(professionId);
  }

  async getCampinaGrandeCouncils(): Promise<CouncilRegion[]> {
    return this.service.getCampinaGrandeCouncils();
  }

  async submitDenuncia(
    complaint: ComplaintDraft,
    pdf: Blob,
    protocol: string
  ): Promise<DenunciaState> {
    try {
      const response = await this.service.submitComplaint(complaint, pdf, protocol);
      return {
        status: 'success',
        protocol: response.protocolo,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar denúncia.',
      };
    }
  }

  getAllBairros = (conselhosRegionais: CouncilRegion[]): string[] =>
    this.service.getAllBairros(conselhosRegionais);

  findConselhoByBairro = (
    bairro: string,
    conselhosRegionais: CouncilRegion[]
  ): CouncilRegion | undefined => this.service.findConselhoByBairro(bairro, conselhosRegionais);
}
