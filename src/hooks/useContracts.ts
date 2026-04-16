import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {contractsApi} from '@/api/contracts';
import {useContractStore} from '@/store/contractStore';
import {
  Contract,
  ContractType,
  CreateContractPayload,
  ExtractedField,
} from '@/types/contract';
import {QUERY_KEYS} from '@/utils/constants';

/**
 * Fetch and cache the full list of contracts.
 */
export function useContracts() {
  const setContracts = useContractStore(s => s.setContracts);

  return useQuery({
    queryKey: [QUERY_KEYS.CONTRACTS],
    queryFn: async () => {
      const contracts = await contractsApi.getContracts();
      setContracts(contracts);
      return contracts;
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch a single contract by ID. Polls every 10 seconds for status updates.
 */
export function useContract(id: string, enablePolling = false) {
  const updateContract = useContractStore(s => s.updateContract);

  return useQuery({
    queryKey: [QUERY_KEYS.CONTRACT, id],
    queryFn: async () => {
      const contract = await contractsApi.getContract(id);
      updateContract(id, contract);
      return contract;
    },
    refetchInterval: enablePolling ? 10_000 : false,
    enabled: Boolean(id),
  });
}

/**
 * Mutation to extract structured fields from raw input.
 * Returns the newly created Contract (contains id + extractedFields).
 */
export function useExtract() {
  const setActiveContract = useContractStore(s => s.setActiveContract);

  return useMutation({
    mutationFn: (payload: CreateContractPayload) =>
      contractsApi.extractFromInput(payload),
    onSuccess: (contract: Contract) => {
      setActiveContract(contract);
    },
  });
}

/**
 * Mutation to generate a contract PDF from reviewed fields.
 */
export function useGenerateContract() {
  const queryClient = useQueryClient();
  const updateContract = useContractStore(s => s.updateContract);

  return useMutation({
    mutationFn: ({
      id,
      fields,
      type,
    }: {
      id: string;
      fields: ExtractedField[];
      type: ContractType;
    }) => contractsApi.generateContract(id, fields, type),
    onSuccess: data => {
      updateContract(data.contract.id, data.contract);
      queryClient.invalidateQueries({queryKey: [QUERY_KEYS.CONTRACTS]});
    },
  });
}

/**
 * Mutation to save the user's drawn signature.
 */
export function useSaveSignature() {
  const queryClient = useQueryClient();
  const updateContract = useContractStore(s => s.updateContract);

  return useMutation({
    mutationFn: ({id, signatureBase64}: {id: string; signatureBase64: string}) =>
      contractsApi.saveSignature(id, signatureBase64),
    onSuccess: (contract: Contract) => {
      updateContract(contract.id, contract);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTRACT, contract.id],
      });
    },
  });
}

/**
 * Mutation to generate a shareable signing link for the other party.
 */
export function useCreateSigningLink() {
  const queryClient = useQueryClient();
  const updateContract = useContractStore(s => s.updateContract);

  return useMutation({
    mutationFn: ({
      id,
      otherPartyEmail,
      otherPartyName,
    }: {
      id: string;
      otherPartyEmail?: string;
      otherPartyName?: string;
    }) => contractsApi.createSigningLink(id, otherPartyEmail, otherPartyName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTRACT, variables.id],
      });
    },
  });
}

/**
 * Mutation to delete a contract.
 */
export function useDeleteContract() {
  const queryClient = useQueryClient();
  const removeContract = useContractStore(s => s.removeContract);

  return useMutation({
    mutationFn: (id: string) => contractsApi.deleteContract(id),
    onSuccess: (_, id) => {
      removeContract(id);
      queryClient.invalidateQueries({queryKey: [QUERY_KEYS.CONTRACTS]});
    },
  });
}
