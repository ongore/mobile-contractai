import apiClient from './client';
import {
  Contract,
  ContractStatus,
  ContractType,
  ExtractedField,
  CreateContractPayload,
  GenerateContractResponse,
  SigningLinkResponse,
} from '@/types/contract';

// ─── Type case normalization ──────────────────────────────────────────────────
// Backend stores ContractType and ContractStatus as uppercase Prisma enums
// (e.g. 'SERVICE_AGREEMENT', 'DRAFT'). Mobile types use lowercase strings.
// These helpers convert between the two representations.

const TYPE_TO_BACKEND: Record<ContractType, string> = {
  service_agreement: 'SERVICE_AGREEMENT',
  freelance_agreement: 'FREELANCE_AGREEMENT',
  payment_agreement: 'PAYMENT_AGREEMENT',
  general_agreement: 'GENERAL_AGREEMENT',
};

function normalizeContract(raw: Record<string, unknown>): Contract {
  return {
    ...(raw as unknown as Contract),
    type: (
      typeof raw.type === 'string' ? raw.type.toLowerCase() : raw.type
    ) as ContractType,
    status: (
      typeof raw.status === 'string' ? raw.status.toLowerCase() : raw.status
    ) as ContractStatus,
  };
}

function normalizeContracts(raw: Record<string, unknown>[]): Contract[] {
  return raw.map(normalizeContract);
}

// ─── API functions ────────────────────────────────────────────────────────────

export const contractsApi = {
  /**
   * Fetch all contracts for the authenticated user.
   */
  getContracts: async (): Promise<Contract[]> => {
    const {data} = await apiClient.get<Record<string, unknown>[]>('/contracts');
    return normalizeContracts(data);
  },

  /**
   * Fetch a single contract by ID.
   */
  getContract: async (id: string): Promise<Contract> => {
    const {data} = await apiClient.get<Record<string, unknown>>(
      `/contracts/${id}`,
    );
    return normalizeContract(data);
  },

  /**
   * Extract structured fields from raw input (text, image, file).
   *
   * Text  → JSON body { method: 'text', text }
   * Image → multipart/form-data { method: 'image', file: <image> }
   * PDF   → multipart/form-data { method: 'pdf',   file: <pdf>   }
   */
  extractFromInput: async (payload: CreateContractPayload): Promise<Contract> => {
    // ── Text path: plain JSON ─────────────────────────────────────────────────
    if (payload.method === 'text') {
      const {data} = await apiClient.post<Record<string, unknown>>(
        '/contracts/extract',
        {method: 'text', text: payload.text},
      );
      return normalizeContract(data);
    }

    // ── Image path: multipart/form-data with the captured/picked image ───────
    if (payload.imageUri) {
      const formData = new FormData();
      formData.append('method', 'image');
      // React Native FormData accepts { uri, type, name } objects as file parts
      formData.append('file', {
        uri: payload.imageUri,
        type: 'image/jpeg',
        name: 'contract-image.jpg',
      } as unknown as Blob);

      const {data} = await apiClient.post<Record<string, unknown>>(
        '/contracts/extract',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );
      return normalizeContract(data);
    }

    // ── PDF path: multipart/form-data with the picked document ───────────────
    if (payload.fileUri) {
      const formData = new FormData();
      formData.append('method', 'pdf');
      formData.append('file', {
        uri: payload.fileUri,
        type: 'application/pdf',
        name: 'document.pdf',
      } as unknown as Blob);

      const {data} = await apiClient.post<Record<string, unknown>>(
        '/contracts/extract',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );
      return normalizeContract(data);
    }

    throw new Error('Invalid extraction payload: provide text, imageUri, or fileUri');
  },

  /**
   * Generate a PDF contract from reviewed fields.
   */
  generateContract: async (
    id: string,
    fields: ExtractedField[],
    type: ContractType,
  ): Promise<GenerateContractResponse> => {
    const {data} = await apiClient.post<{
      pdfUrl: string;
      contract: Record<string, unknown>;
    }>(`/contracts/${id}/generate`, {
      fields,
      type: TYPE_TO_BACKEND[type],
    });
    return {
      pdfUrl: data.pdfUrl,
      contract: normalizeContract(data.contract),
    };
  },

  /**
   * Save the user's drawn signature for a contract.
   * Field name must match backend's signContractSchema: { signature }.
   */
  saveSignature: async (
    id: string,
    signatureBase64: string,
  ): Promise<Contract> => {
    const {data} = await apiClient.post<Record<string, unknown>>(
      `/contracts/${id}/sign`,
      {signature: signatureBase64},
    );
    return normalizeContract(data);
  },

  /**
   * Create a shareable signing link for the other party.
   * Email and name are optional — the link is shared manually by the user.
   */
  createSigningLink: async (
    id: string,
    otherPartyEmail?: string,
    otherPartyName?: string,
  ): Promise<SigningLinkResponse> => {
    const {data} = await apiClient.post<{
      contract: Record<string, unknown>;
      signingLink: string;
      expiresAt: string | null;
    }>(`/contracts/${id}/send`, {otherPartyEmail, otherPartyName});
    return {
      contract: normalizeContract(data.contract),
      signingLink: data.signingLink,
      expiresAt: data.expiresAt,
    };
  },

  /**
   * Manually update the status of a contract.
   */
  updateContractStatus: async (
    id: string,
    status: ContractStatus,
  ): Promise<Contract> => {
    const {data} = await apiClient.patch<Record<string, unknown>>(
      `/contracts/${id}/status`,
      {status},
    );
    return normalizeContract(data);
  },

  /**
   * Delete a contract permanently.
   */
  deleteContract: async (id: string): Promise<void> => {
    await apiClient.delete(`/contracts/${id}`);
  },
};
