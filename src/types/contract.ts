export type ContractStatus =
  | 'draft'
  | 'generated'
  | 'signed_by_me'
  | 'sent'
  | 'viewed'
  | 'signed_by_other'
  | 'completed';

export type ContractType =
  | 'service_agreement'
  | 'freelance_agreement'
  | 'payment_agreement'
  | 'general_agreement';

export type InputMethod = 'screenshot' | 'text' | 'invoice' | 'camera';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  required: boolean;
}

export interface Contract {
  id: string;
  userId: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  extractedFields: ExtractedField[];
  pdfUrl?: string;
  signingLink?: string;
  mySignature?: string;
  otherPartySignature?: string;
  createdAt: string;
  updatedAt: string;
  otherPartyEmail?: string;
  otherPartyName?: string;
}

export interface CreateContractPayload {
  method: InputMethod;
  text?: string;
  imageUri?: string;    // local file:// URI used for multipart image upload
  imageBase64?: string; // kept for backward compat but imageUri is preferred
  fileUri?: string;     // local file:// URI for PDF upload
}

export interface GenerateContractPayload {
  id: string;
  fields: ExtractedField[];
  type: ContractType;
}

export interface SigningLinkResponse {
  contract: Contract;
  signingLink: string;
  expiresAt: string | null;
}

export interface GenerateContractResponse {
  pdfUrl: string;
  contract: Contract;
}
