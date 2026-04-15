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
   * Returns the newly created Contract (which includes extractedFields).
   */
  extractFromInput: async (payload: CreateContractPayload): Promise<Contract> => {
    const {data} = await apiClient.post<Record<string, unknown>>(
      '/contracts/extract',
      payload,
    );
    return normalizeContract(data);
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
   */
  createSigningLink: async (
    id: string,
    otherPartyEmail: string,
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
