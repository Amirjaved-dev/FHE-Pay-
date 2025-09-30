import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Stream {
  id: string;
  employer: string;
  employee: string;
  duration: number;
  startTime: number;
  totalWithdrawn: string;
  active: boolean;
  encryptedSalary?: Uint8Array;
  decryptedSalary?: string;
}

export interface WithdrawalRequest {
  id: string;
  streamId: string;
  employee: string;
  requestTime: number;
  processed: boolean;
  amount?: string;
}

export interface User {
  address: string;
  publicKey?: string;
  isEmployer: boolean;
  isEmployee: boolean;
}

export interface AppState {
  // User state
  user: User | null;
  isConnected: boolean;

  // FHE state
  fheInitialized: boolean;
  fheInstance: any | null;
  fhePublicKey: string | null;

  // Streams state
  streams: Stream[];
  employerStreams: Stream[];
  employeeStreams: Stream[];
  selectedStream: Stream | null;

  // Withdrawal requests
  withdrawalRequests: WithdrawalRequest[];

  // UI state
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Theme state
  theme: 'light' | 'dark' | 'system';

  // Modal state
  showCreateStreamModal: boolean;
  showWithdrawModal: boolean;
  showStreamDetailsModal: boolean;
}

export interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  setConnected: (connected: boolean) => void;
  updateUserRole: (isEmployer: boolean, isEmployee: boolean) => void;

  // FHE actions
  setFHEInitialized: (initialized: boolean) => void;
  setFheInstance: (instance: any | null) => void;
  setFHEPublicKey: (publicKey: string | null) => void;

  // Stream actions
  setStreams: (streams: Stream[]) => void;
  addStream: (stream: Stream) => void;
  updateStream: (streamId: string, updates: Partial<Stream>) => void;
  removeStream: (streamId: string) => void;
  setSelectedStream: (stream: Stream | null) => void;

  // Filter streams by user role
  setEmployerStreams: (streams: Stream[]) => void;
  setEmployeeStreams: (streams: Stream[]) => void;

  // Withdrawal actions
  setWithdrawalRequests: (requests: WithdrawalRequest[]) => void;
  addWithdrawalRequest: (request: WithdrawalRequest) => void;
  updateWithdrawalRequest: (requestId: string, updates: Partial<WithdrawalRequest>) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;

  // Modal actions
  setShowCreateStreamModal: (show: boolean) => void;
  setShowWithdrawModal: (show: boolean) => void;
  setShowStreamDetailsModal: (show: boolean) => void;

  // Utility actions
  reset: () => void;
  refreshStreams: () => void;
}

type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  // User state
  user: null,
  isConnected: false,

  // FHE state
  fheInitialized: false,
  fheInstance: null,
  fhePublicKey: null,

  // Streams state
  streams: [],
  employerStreams: [],
  employeeStreams: [],
  selectedStream: null,

  // Withdrawal requests
  withdrawalRequests: [],

  // UI state
  isLoading: false,
  error: null,
  successMessage: null,

  // Theme state
  theme: 'system',

  // Modal state
  showCreateStreamModal: false,
  showWithdrawModal: false,
  showStreamDetailsModal: false,
};

// Create the store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // User actions
      setUser: (user) => set({ user }),
      setConnected: (isConnected) => set({ isConnected }),
      updateUserRole: (isEmployer, isEmployee) => 
        set((state) => ({
          user: state.user ? { ...state.user, isEmployer, isEmployee } : null
        })),
      
      // FHE actions
      setFHEInitialized: (fheInitialized) => set({ fheInitialized }),
      setFheInstance: (fheInstance) => set({ fheInstance }),
      setFHEPublicKey: (fhePublicKey) => set({ fhePublicKey }),
      
      // Stream actions
      setStreams: (streams) => {
        const { user } = get();
        if (!user) {
          set({ streams });
          return;
        }
        
        const employerStreams = streams.filter(s => s.employer.toLowerCase() === user.address.toLowerCase());
        const employeeStreams = streams.filter(s => s.employee.toLowerCase() === user.address.toLowerCase());
        
        set({ streams, employerStreams, employeeStreams });
      },
      
      addStream: (stream) => {
        const { streams, user } = get();
        const newStreams = [...streams, stream];
        
        if (user) {
          const employerStreams = newStreams.filter(s => s.employer.toLowerCase() === user.address.toLowerCase());
          const employeeStreams = newStreams.filter(s => s.employee.toLowerCase() === user.address.toLowerCase());
          set({ streams: newStreams, employerStreams, employeeStreams });
        } else {
          set({ streams: newStreams });
        }
      },
      
      updateStream: (streamId, updates) => {
        const { streams } = get();
        const updatedStreams = streams.map(stream => 
          stream.id === streamId ? { ...stream, ...updates } : stream
        );
        get().setStreams(updatedStreams);
      },
      
      removeStream: (streamId) => {
        const { streams } = get();
        const filteredStreams = streams.filter(stream => stream.id !== streamId);
        get().setStreams(filteredStreams);
      },
      
      setSelectedStream: (selectedStream) => set({ selectedStream }),
      
      setEmployerStreams: (employerStreams) => set({ employerStreams }),
      setEmployeeStreams: (employeeStreams) => set({ employeeStreams }),
      
      // Withdrawal actions
      setWithdrawalRequests: (withdrawalRequests) => set({ withdrawalRequests }),
      
      addWithdrawalRequest: (request) => 
        set((state) => ({ 
          withdrawalRequests: [...state.withdrawalRequests, request] 
        })),
      
      updateWithdrawalRequest: (requestId, updates) => 
        set((state) => ({
          withdrawalRequests: state.withdrawalRequests.map(req => 
            req.id === requestId ? { ...req, ...updates } : req
          )
        })),
      
      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSuccessMessage: (successMessage) => set({ successMessage }),
      clearMessages: () => set({ error: null, successMessage: null }),

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      toggleTheme: () => {
        const { theme } = get();
        let newTheme: 'light' | 'dark' | 'system';
        if (theme === 'light') {
          newTheme = 'dark';
        } else if (theme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        get().setTheme(newTheme);
      },

      // Modal actions
      setShowCreateStreamModal: (showCreateStreamModal) => set({ showCreateStreamModal }),
      setShowWithdrawModal: (showWithdrawModal) => set({ showWithdrawModal }),
      setShowStreamDetailsModal: (showStreamDetailsModal) => set({ showStreamDetailsModal }),
      
      // Utility actions
      reset: () => set(initialState),
      
      refreshStreams: async () => {
        // This will be implemented to fetch streams from the contract
        console.log('Refreshing streams...');
      },
    }),
    {
      name: 'fhe-pay-storage',
      partialize: (state) => ({
        // Only persist certain parts of the state
        fhePublicKey: state.fhePublicKey,
        user: state.user,
        theme: state.theme,
      }),
    }
  )
);

// Selectors for easier state access
export const useUser = () => useAppStore((state) => state.user);
export const useIsConnected = () => useAppStore((state) => state.isConnected);
export const useFHEState = () => useAppStore((state) => ({
  initialized: state.fheInitialized,
  instance: state.fheInstance,
  publicKey: state.fhePublicKey,
}));
export const useStreams = () => useAppStore((state) => ({
  all: state.streams,
  employer: state.employerStreams,
  employee: state.employeeStreams,
  selected: state.selectedStream,
}));
export const useUIState = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  successMessage: state.successMessage,
}));

// Modal state selectors
export const useModals = () => useAppStore((state) => ({
  showCreateStreamModal: state.showCreateStreamModal,
  showWithdrawModal: state.showWithdrawModal,
  showStreamDetailsModal: state.showStreamDetailsModal,
}));

// Theme selector
export const useTheme = () => useAppStore((state) => state.theme);