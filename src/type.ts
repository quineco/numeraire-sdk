import { Connection, PublicKey } from "@solana/web3.js";
import { Numeraire } from "./idl/numeraire";
import { MethodsBuilder } from "@coral-xyz/anchor/dist/cjs/program/namespace/methods";
import { BN, Wallet } from "@coral-xyz/anchor";
export interface PairInfo {
  amount: number;
  mint: PublicKey;
  A: number;
  a: number;
  b: number;
  spl_2022: boolean;
  pairSeed: PublicKey;
  alpha: number;
  beta: number;
  decimals?: number;
  adder_token_account?: PublicKey;
}

export interface Pair {
  pair: PublicKey;
  xVault: PublicKey;
  xMint: PublicKey;
  xIs2022: number;
  pairAuthority: PublicKey;
  decimals?: number;
  txHash?: string;
  newestRateNum: number;
  newestRateDenom: number;
  call?: MethodsBuilder<Numeraire, any>;
  curveAlpha: number;
  curveBeta: number;
  xVaultBalance?: number;
}

export interface PoolInfo {
  poolSeed: PublicKey;
  pairInfo?: PairInfo[];
  weights: number[];
  invT: number;
  invTMax: number;
  feeNum: number;
  feeDenom: number;
  decimals: number;
  lpMint: PublicKey;
  pool: PublicKey;
  numStables: number;
  totalWeight: number;
  pairs?: Pair[];
}

export interface AddInfo {
  pool: PublicKey;
  maxAmountsIn: number[];
  minLpTokenMintAmount: number;
  takeSwaps: boolean;
  swapPaths?: number[];
  swapAmounts?: number[];
  requireCuIx?: boolean;
  cuLimit?: number;
}

export interface RemoveInfo {
  pool: PublicKey;
  lpTokenRedeemAmount: number;
  minAmountsOut?: number[];
  out?: number | string;
  requireCuIx?: boolean;
  cuLimit?: number;
}

export interface SwapInInfo {
  pool: PublicKey;
  in: number | string;
  out: number | string;
  exactAmountIn: number | BN;
  minAmountOut: number;
  hints?: number[];
  pairs?: Pair[];
  cuLimit?: number;
  requireCuIx?: boolean;
  inTrader?: PublicKey;
  outTrader?: PublicKey;
  decimals?: number;
}

export interface SwapOutInfo {
  pool: PublicKey;
  in: number | string;
  out: number | string;
  exactAmountOut: number;
  maxAmountIn: number;
  hints?: number[];
  pairs?: Pair[];
}

export type InitProps = {
  payer?: Wallet | any;
  applyD?: boolean;
  connection?: Connection;
};

export type MyAccount = {
  pubkey: PublicKey;
  isWritable: boolean;
  isSigner: boolean;
};
