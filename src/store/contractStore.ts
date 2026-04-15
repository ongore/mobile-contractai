import {create} from 'zustand';
import {Contract} from '@/types/contract';

interface ContractState {
  contracts: Contract[];
  activeContract: Contract | null;
  setContracts: (contracts: Contract[]) => void;
  setActiveContract: (contract: Contract | null) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  addContract: (contract: Contract) => void;
  removeContract: (id: string) => void;
  clearActive: () => void;
}

export const useContractStore = create<ContractState>()(set => ({
  contracts: [],
  activeContract: null,
  setContracts: (contracts: Contract[]) => set({contracts}),
  setActiveContract: (contract: Contract | null) =>
    set({activeContract: contract}),
  updateContract: (id: string, updates: Partial<Contract>) =>
    set(state => ({
      contracts: state.contracts.map(c =>
        c.id === id ? {...c, ...updates} : c,
      ),
      activeContract:
        state.activeContract?.id === id
          ? {...state.activeContract, ...updates}
          : state.activeContract,
    })),
  addContract: (contract: Contract) =>
    set(state => ({contracts: [contract, ...state.contracts]})),
  removeContract: (id: string) =>
    set(state => ({
      contracts: state.contracts.filter(c => c.id !== id),
      activeContract:
        state.activeContract?.id === id ? null : state.activeContract,
    })),
  clearActive: () => set({activeContract: null}),
}));
