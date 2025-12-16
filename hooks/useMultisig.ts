"use client";

import { useCallback, useMemo, useState } from "react";
import { useStacks } from "./useStacks";

/**
 * Multisig signer information
 */
export interface MultisigSigner {
  address: string;
  hasSigned: boolean;
}

/**
 * Transaction status
 */
export type TransactionStatus = "pending" | "signed" | "ready-to-execute" | "executed" | "failed";

/**
 * Multisig transaction
 */
export interface MultisigTransaction {
  id: string;
  type: "stx-transfer" | "token-transfer";
  amount: string;
  recipient: string;
  tokenContract?: string; // For SIP-010 transfers
  txHash: string;
  status: TransactionStatus;
  signers: MultisigSigner[];
  timestamp: number;
  executedTxId?: string; // On-chain transaction ID after execution
}

/**
 * Multisig vault data
 */
export interface MultisigVault {
  address: string;
  signers: string[];
  threshold: number;
  balance: string; // In micro-STX
  transactions: MultisigTransaction[];
}

/**
 * Hook return type
 */
export interface UseMultisigReturn {
  /** Multisig vault data */
  vault: MultisigVault | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether current user is a signer */
  isSigner: boolean;
  /** Fetch vault data */
  fetchVault: (address: string) => Promise<void>;
  /** Get transaction by ID */
  getTransaction: (txId: string) => MultisigTransaction | undefined;
  /** Check if transaction is ready to execute */
  isReadyToExecute: (txId: string) => boolean;
  /** Get pending transactions */
  getPendingTransactions: () => MultisigTransaction[];
  /** Get executed transactions */
  getExecutedTransactions: () => MultisigTransaction[];
  /** Get signature count for transaction */
  getSignatureCount: (txId: string) => number;
  /** Check if user has signed transaction */
  hasUserSigned: (txId: string) => boolean;
}

/**
 * Hook for managing multisig vault interactions
 *
 * Handles:
 * - Fetching multisig vault data from contract
 * - Managing transaction state
 * - Tracking signatures
 * - Checking execution readiness
 *
 * @example
 * ```tsx
 * const { vault, isSigner, fetchVault } = useMultisig();
 *
 * useEffect(() => {
 *   if (vaultAddress) {
 *     fetchVault(vaultAddress);
 *   }
 * }, [vaultAddress]);
 *
 * if (!vault) return <div>Loading...</div>;
 *
 * return (
 *   <div>
 *     <h1>{vault.address}</h1>
 *     <p>Threshold: {vault.threshold}/{vault.signers.length}</p>
 *   </div>
 * );
 * ```
 */
export function useMultisig(): UseMultisigReturn {
  const { address: userAddress } = useStacks();
  const [vault, setVault] = useState<MultisigVault | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch multisig vault data from contract
   * In production, this would call the actual contract via @stacks/transactions
   */
  const fetchVault = useCallback(async (vaultAddress: string) => {
    if (!vaultAddress) {
      setError("Vault address is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual contract call
      // This is a placeholder that demonstrates the expected data structure
      const mockVaultData: MultisigVault = {
        address: vaultAddress,
        signers: [
          "SP2RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
          "ST2RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
          "SP3RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
        ],
        threshold: 2,
        balance: "5000000000", // 5000 STX in micro-STX
        transactions: [
          {
            id: "txn-001",
            type: "stx-transfer",
            amount: "1000000", // 1 STX
            recipient: "ST2RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
            txHash: "0x1234567890abcdef",
            status: "pending",
            signers: [
              {
                address: "SP2RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
                hasSigned: true,
              },
              {
                address: "ST2RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
                hasSigned: false,
              },
              {
                address: "SP3RVXN8ZCJQY8ZCJQY8ZCJQY8ZCJQY8ZCJQY8Z",
                hasSigned: false,
              },
            ],
            timestamp: Date.now(),
          },
        ],
      };

      setVault(mockVaultData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch vault data";
      setError(errorMessage);
      console.error("Error fetching vault:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if current user is a signer in the vault
   */
  const isSigner = useMemo(() => {
    if (!vault || !userAddress) return false;
    return vault.signers.includes(userAddress);
  }, [vault, userAddress]);

  /**
   * Get transaction by ID
   */
  const getTransaction = useCallback(
    (txId: string): MultisigTransaction | undefined => {
      return vault?.transactions.find((tx) => tx.id === txId);
    },
    [vault]
  );

  /**
   * Get signature count for a transaction
   */
  const getSignatureCount = useCallback(
    (txId: string): number => {
      const tx = getTransaction(txId);
      if (!tx) return 0;
      return tx.signers.filter((signer) => signer.hasSigned).length;
    },
    [getTransaction]
  );

  /**
   * Check if transaction is ready to execute
   * Ready when signature count >= threshold
   */
  const isReadyToExecute = useCallback(
    (txId: string): boolean => {
      if (!vault) return false;
      const signatureCount = getSignatureCount(txId);
      return signatureCount >= vault.threshold;
    },
    [vault, getSignatureCount]
  );

  /**
   * Get pending transactions (not yet executed)
   */
  const getPendingTransactions = useCallback((): MultisigTransaction[] => {
    if (!vault) return [];
    return vault.transactions.filter((tx) => tx.status !== "executed");
  }, [vault]);

  /**
   * Get executed transactions
   */
  const getExecutedTransactions = useCallback((): MultisigTransaction[] => {
    if (!vault) return [];
    return vault.transactions.filter((tx) => tx.status === "executed");
  }, [vault]);

  /**
   * Check if current user has signed a transaction
   */
  const hasUserSigned = useCallback(
    (txId: string): boolean => {
      if (!userAddress) return false;
      const tx = getTransaction(txId);
      if (!tx) return false;
      const signer = tx.signers.find((s) => s.address === userAddress);
      return signer?.hasSigned ?? false;
    },
    [userAddress, getTransaction]
  );

  return {
    vault,
    isLoading,
    error,
    isSigner,
    fetchVault,
    getTransaction,
    isReadyToExecute,
    getPendingTransactions,
    getExecutedTransactions,
    getSignatureCount,
    hasUserSigned,
  };
}
