"use client";

import { Copy, ExternalLink, Users, Shield, Coins } from "lucide-react";

interface MultisigDashboardProps {
  multisigAddress: string;
}

export function MultisigDashboard({ multisigAddress }: MultisigDashboardProps) {
  // Mock data - in a real implementation, this would come from contract reads
  const mockData = {
    signers: [
      { address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", role: "Admin", status: "active" },
      { address: "ST33QGZ09QT4F0RP7AW0GG52XSTJZGNB6YEJDENNX", role: "Treasurer", status: "active" },
      { address: "ST1K5WPWX5WDABEC8X3HYVNPHRZ30Y6HTKMG3KDNK", role: "Security", status: "active" },
    ],
    threshold: 2,
    totalSigners: 3,
    balances: {
      stx: "1250000", // in microSTX
      sbtc: "5000000", // in satoshis
    },
    transactionCount: 47,
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  const formatSTX = (microSTX: string) => {
    const stx = parseInt(microSTX) / 1000000;
    return stx.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatSBTC = (satoshis: string) => {
    const btc = parseInt(satoshis) / 100000000;
    return btc.toFixed(8);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Multisig Dashboard</h1>
          <p className="text-slate-400">
            Secure multi-signature vault for threshold-based transactions
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">
            {mockData.threshold} of {mockData.totalSigners} required
          </span>
        </div>
      </div>

      {/* Multisig Address */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Vault Address</p>
            <p className="font-mono text-lg text-white">{formatAddress(multisigAddress)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(multisigAddress)}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <a
              href={`https://explorer.stacks.co/address/${multisigAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <ExternalLink className="h-4 w-4" />
              Explorer
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Signers</p>
              <p className="text-2xl font-semibold text-white">
                {mockData.totalSigners}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <Coins className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">STX Balance</p>
              <p className="text-2xl font-semibold text-white">
                {formatSTX(mockData.balances.stx)} STX
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
              <Shield className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Transactions</p>
              <p className="text-2xl font-semibold text-white">
                {mockData.transactionCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Signers List */}
      <div className="rounded-2xl border border-white/5 bg-white/5">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Authorized Signers</h3>
          <p className="text-sm text-slate-400">
            Signers who can propose and approve transactions
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {mockData.signers.map((signer, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                    <Users className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-white">
                      {formatAddress(signer.address)}
                    </p>
                    <p className="text-sm text-slate-400">{signer.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Balances */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Vault Balances</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                <Coins className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Stacks (STX)</p>
                <p className="text-sm text-slate-400">Native currency</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-white">
              {formatSTX(mockData.balances.stx)}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
                <Shield className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">sBTC</p>
                <p className="text-sm text-slate-400">Bitcoin-backed token</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-white">
              {formatSBTC(mockData.balances.sbtc)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
