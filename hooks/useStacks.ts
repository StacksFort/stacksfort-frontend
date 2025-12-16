"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { showConnect } from "@stacks/connect";
import { appDetails, userSession } from "@/lib/stacks-session";

/**
 * User profile data from Stacks wallet
 */
export interface StacksUserProfile {
  stxAddress?: {
    mainnet?: string;
    testnet?: string;
  };
}

/**
 * Complete user data structure
 */
export interface StacksUserData {
  profile?: StacksUserProfile;
}

/**
 * Network type
 */
export type StacksNetwork = "mainnet" | "testnet" | "disconnected";

/**
 * Hook state and methods
 */
export interface UseStacksReturn {
  /** User's STX address on current network */
  address: string | null;
  /** Current network (mainnet, testnet, or disconnected) */
  network: StacksNetwork;
  /** Whether user is signed in */
  isSignedIn: boolean;
  /** Whether hook has finished initializing */
  isReady: boolean;
  /** Connect wallet */
  connect: () => void;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Full user data */
  userData: StacksUserData | null;
}

/**
 * Get absolute URL for app icon
 */
const getAppIcon = (): string => {
  if (typeof window === "undefined") return appDetails.icon;
  try {
    return new URL(appDetails.icon, window.location.origin).toString();
  } catch {
    return appDetails.icon;
  }
};

/**
 * Hook for managing Stacks wallet connection and user session
 *
 * Handles:
 * - Wallet connection via Leather/Xverse
 * - Session persistence across page reloads
 * - User data management
 * - Network detection (mainnet/testnet)
 *
 * @example
 * ```tsx
 * const { address, network, isSignedIn, connect, disconnect } = useStacks();
 *
 * if (!isSignedIn) {
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 *
 * return <div>Connected: {address} on {network}</div>;
 * ```
 */
export function useStacks(): UseStacksReturn {
  const [userData, setUserData] = useState<StacksUserData | null>(null);
  const [isReady, setIsReady] = useState(false);

  /**
   * Initialize session on mount
   * Handles pending sign-in and restores existing session
   */
  useEffect(() => {
    let cancelled = false;

    const initializeSession = async () => {
      try {
        // Check if there's a pending sign-in (user just authenticated)
        if (userSession.isSignInPending()) {
          const data = await userSession.handlePendingSignIn();
          if (!cancelled) {
            setUserData(data);
          }
        }
        // Check if user already has an active session
        else if (userSession.isUserSignedIn()) {
          const data = userSession.loadUserData();
          if (!cancelled) {
            setUserData(data);
          }
        }
      } catch (error) {
        console.error("Failed to initialize Stacks session:", error);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    initializeSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Initiate wallet connection flow
   */
  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    showConnect({
      userSession,
      appDetails: {
        ...appDetails,
        icon: getAppIcon(),
      },
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
      },
      onCancel: () => {
        // User cancelled connection
      },
    });
  }, []);

  /**
   * Disconnect wallet and clear session
   */
  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setUserData(null);
  }, []);

  /**
   * Determine current network from user data
   */
  const network: StacksNetwork = useMemo(() => {
    if (!userData?.profile?.stxAddress) {
      return "disconnected";
    }

    if (userData.profile.stxAddress.testnet) {
      return "testnet";
    }

    if (userData.profile.stxAddress.mainnet) {
      return "mainnet";
    }

    return "disconnected";
  }, [userData]);

  /**
   * Get current user address based on network
   */
  const address: string | null = useMemo(() => {
    if (!userData?.profile?.stxAddress) {
      return null;
    }

    // Prefer testnet if available, fall back to mainnet
    return (
      userData.profile.stxAddress.testnet ||
      userData.profile.stxAddress.mainnet ||
      null
    );
  }, [userData]);

  return {
    address,
    network,
    isSignedIn: !!userData,
    isReady,
    connect,
    disconnect,
    userData,
  };
}
