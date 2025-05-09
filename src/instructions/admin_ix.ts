import {
  PublicKey,
  ComputeBudgetProgram,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { MAX_STABLES_PER_POOL, NORMALIZED_VALUE_DECIMALS } from "./../constant";
import { MyAccount, Pair, PairInfo, PoolInfo } from "../type";
import { f64ToU64_LittleEndian, getTrueAlpha, state } from "../utils";
import { getLiqAccounts } from "../getters";

export const createPair = async (
  {
    amount,
    mint,
    A,
    a,
    b,
    spl_2022,
    pairSeed,
    decimals,
    alpha,
    beta,
    adder_token_account = undefined,
  }: PairInfo,
  send = true
): Promise<Pair> => {
  if (typeof decimals !== "number") throw new Error("Decimals required");
  const d = state.applyD ? 10 ** decimals : 1;

  if (a !== b || beta !== 1 / alpha) throw new Error("need a=b");

  let trueAlpha: number = await getTrueAlpha(A, a);

  if (Math.abs(trueAlpha - alpha) > 0.00001)
    throw new Error(`Expected alpha = ${alpha}, computed alpha = ${trueAlpha}`);

  const dNorm = state.applyD ? 10 ** NORMALIZED_VALUE_DECIMALS : 1;
  const call = await state.program.methods
    .initVirtualStablePair({
      decimals,
      curveAmp: new BN(A * dNorm),
      curveA: new BN(a * dNorm),
      curveB: new BN(b * dNorm),
      initAmount: new BN(amount * d),
      pairSeed,
      curveAlpha: new BN(f64ToU64_LittleEndian(trueAlpha)),
      curveBeta: new BN(f64ToU64_LittleEndian(1 / trueAlpha)),
    })
    .accounts({
      xMint: mint,
      xAdder:
        adder_token_account ||
        getAssociatedTokenAddressSync(
          mint,
          state.wallet.publicKey,
          false,
          spl_2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
        ),
      payer: state.wallet.publicKey,
      tokenProgram: spl_2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
    } as any);

  const keys = await call.pubkeys();

  try {
    if (send) {
      return {
        txHash: await call.rpc(),
        decimals,
        xIs2022: spl_2022 ? 1 : 0,
        ...keys,
      } as Pair;
    } else {
      return { call, ...keys } as unknown as Pair;
    }
  } catch (e) {
    console.log("Create pair error", e);
  }
};

export const createPool = async (
  info: PoolInfo,
  pairs: Pair[] = [],
  useAnchor = false
) => {
  const { poolSeed, invT, feeNum, feeDenom, decimals } = info;
  const d = state.applyD ? 10 ** decimals : 1;
  if (info.pairInfo !== undefined && pairs.length != 0)
    throw new Error("Provide one of undeployed pair infos or deployed pairs");

  const instrs = [];
  for (const p of info.pairInfo === undefined ? [] : info.pairInfo) {
    const { call, ...pair } = await createPair(
      { decimals: p.decimals === undefined ? decimals : p.decimals, ...p },
      useAnchor
    );
    pairs.push(pair);

    if (useAnchor) {
      await call.rpc();
    } else {
      instrs.push(...(await call.transaction()).instructions);
    }
  }

  const remainingAccounts: MyAccount[] = [];
  pairs.forEach((pair) => {
    // stable
    remainingAccounts.push({
      pubkey: pair.pair,
      isWritable: true,
      isSigner: false,
    });
    // authority
    remainingAccounts.push({
      pubkey: pair.pairAuthority,
      isWritable: false,
      isSigner: false,
    });
    // vault
    remainingAccounts.push({
      pubkey: pair.xVault,
      isWritable: true,
      isSigner: false,
    });
  });

  const weights = Array(MAX_STABLES_PER_POOL).fill(0);
  for (let i = 0; i < info.weights.length; i++) weights[i] = info.weights[i];

  let call = state.program.methods
    .createPool({
      decimals,
      weights,
      invT: new BN(invT * d),
      invTMax: new BN((info.invTMax || 0) * d),
      poolSeed,
      feeNum,
      feeDenom,
    })
    .remainingAccounts(remainingAccounts)
    .accounts({ payer: state.wallet.publicKey })
    .preInstructions([
      ComputeBudgetProgram.setComputeUnitLimit({ units: 800000 }),
    ]);

  const pool = await call.pubkeys();

  if (useAnchor) {
    return { call, pool, pairs };
  }

  instrs.push(...(await call.transaction()).instructions);

  const blockHash = await state.provider.connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: state.wallet.publicKey,
    recentBlockhash: blockHash.blockhash,
    instructions: instrs,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  try {
    await state.provider.connection.simulateTransaction(transaction);
  } catch (e) {
    console.log(e);
    throw e;
  }

  async function rpc(opts = {}) {
    const signedTransaction = await state.provider.wallet.signTransaction(
      transaction
    );
    const txHash = await state.provider.connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        maxRetries: 20,
      }
    );
    await state.provider.connection.confirmTransaction(txHash, "confirmed");
    return txHash;
  }
  return { call, pool, pairs };
};

export const setWhitelistedAdder = async ({
  pool,
  adder,
}: {
  pool: PublicKey;
  adder: PublicKey;
}) => {
  const call = await state.program.methods
    .setWhitelistedAdder({ whitelistedAddr: adder })
    .accounts({ pool } as any);

  return { call };
};

export const setPoolStatus = async ({
  pool,
  status,
}: {
  pool: PublicKey;
  status: number;
}) => {
  const call = await state.program.methods
    .setStatus({ status })
    .accounts({ pool } as any);

  return { call };
};

export const setLpTokenMetadata = async ({
  pool,
  name,
  symbol,
  uri,
}: {
  pool: PublicKey;
  name: string;
  symbol: string;
  uri: string;
}) => {
  const call = await state.program.methods
    .setLpTokenMetadata({ name, symbol, uri })
    .accounts({ pool } as any);

  return { call };
};

export const setRate = async (data: {
  rateMint: PublicKey;
  rateNum?: number;
  rateDenom?: number;
}) => {
  const readFromMint = data.rateNum === undefined;

  if (readFromMint != (data.rateDenom === undefined))
    throw new Error("Both num and denom should be provided or elided");

  let call;
  if (readFromMint) {
    call = await state.program.methods
      .setRate({ rateMint: data.rateMint, rateNum: 0, rateDenom: 0 })
      .accounts({ pairMint: data.rateMint });
  } else {
    call = await state.program.methods
      .setRate({
        rateMint: data.rateMint,
        rateNum: data.rateNum,
        rateDenom: data.rateDenom,
      })
      .accounts({ pairMint: null });
  }

  return { call };
};

export const setRateAsWPC = async (data: {
  wpc_payer: Keypair;
  rateMint: PublicKey;
  rateNum?: number;
  rateDenom?: number;
}) => {
  const readFromMint = data.rateNum === undefined;

  if (readFromMint != (data.rateDenom === undefined))
    throw new Error("Both num and denom should be provided or elided");

  let call;
  if (readFromMint) {
    call = await state.program.methods
      .setRate({ rateMint: data.rateMint, rateNum: 0, rateDenom: 0 })
      .accounts({ pairMint: data.rateMint, payer: data.wpc_payer.publicKey })
      .signers([data.wpc_payer]);
  } else {
    call = await state.program.methods
      .setRate({
        rateMint: data.rateMint,
        rateNum: data.rateNum,
        rateDenom: data.rateDenom,
      })
      .accounts({ pairMint: null, payer: data.wpc_payer.publicKey })
      .signers([data.wpc_payer]);
  }

  return { call };
};

export const setNumeraireOwner = async (newOwner: PublicKey) => {
  const call = await state.program.methods
    .setNumeraireOwner({ owner: newOwner })
    .accounts({ pairMint: null });

  return { call };
};

export const setOwner = async ({
  pool,
  newOwner,
}: {
  pool: PublicKey;
  newOwner: PublicKey;
}) => {
  const call = await state.program.methods
    .setOwner({ owner: newOwner })
    .accounts({ pool } as any);

  return { call };
};

export const setNumeraireStatus = async (status: number) => {
  const call = await state.program.methods
    .setNumeraireStatus({ status })
    .accounts({ pairMint: null });

  return { call };
};

export const setNumeraireWhitelistedPoolCreator = async (
  creator: PublicKey
) => {
  const call = await state.program.methods
    .setNumeraireWhitelistedPoolCreator({ whitelistedAddr: creator })
    .accounts({ pairMint: null });

  return { call };
};

export const compound = async ({
  pool,
  requireCuIx = true,
  cuLimit = 1400000,
}: {
  pool: PublicKey;
  requireCuIx?: boolean;
  cuLimit?: number;
}) => {
  const { accounts, remainingAccounts } = await getLiqAccounts(
    pool,
    undefined,
    [],
    { isCompound: true }
  );

  const preInstructions = requireCuIx
    ? [
        ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 300_000 }),
      ]
    : [];

  const call = await state.program.methods
    .compound()
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .preInstructions(preInstructions);

  return { call };
};

export const setWeights = async (data: {
  pool: PublicKey;
  weights: number[];
}) => {
  if (data.weights.length !== MAX_STABLES_PER_POOL)
    throw new Error(
      `Weights length should be equal to ${MAX_STABLES_PER_POOL}`
    );

  const call = await state.program.methods
    .setWeights({ weights: data.weights })
    .accounts({
      payer: state.wallet.publicKey,
      pool: data.pool,
    } as any);

  return { call };
};

export const setBondingCurveParameters = async (
  { A, a, b, decimals, alpha, beta }: PairInfo,
  pool: PublicKey,
  pairIndex: number,
  newUpperA: number | undefined,
  newLowerA: number | undefined,
  newLowerB: number | undefined,
  newAlpha: number | undefined,
  newBeta: number | undefined
) => {
  // Either take the old valud or the new one if provided
  A = newUpperA || A;
  a = newLowerA || a;
  b = newLowerB || b;
  alpha = newAlpha || alpha;
  beta = newBeta || beta;

  if (typeof decimals !== "number") throw new Error("Decimals required");

  const d = state.applyD ? 10 ** decimals : 1;

  if (a !== b || beta !== 1 / alpha) throw new Error("need a=b");

  let trueAlpha: number = await getTrueAlpha(A, a);

  if (Math.abs(trueAlpha - alpha) > 0.00001)
    throw new Error(`Expected alpha = ${alpha}, computed alpha = ${trueAlpha}`);

  const dNorm = state.applyD ? 10 ** NORMALIZED_VALUE_DECIMALS : 1;

  const call = await state.program.methods
    .setBondingCurveParametersForPair({
      pairIndex,
      trueAlpha: new BN(f64ToU64_LittleEndian(trueAlpha)),
      curveAmp: new BN(A * dNorm),
      curveA: new BN(a * dNorm),
      curveB: new BN(b * dNorm),
      curveAlpha: new BN(f64ToU64_LittleEndian(trueAlpha)),
      curveBeta: new BN(f64ToU64_LittleEndian(1 / trueAlpha)),
    })
    .accounts({
      pool,
      payer: state.wallet.publicKey,
    } as any);

  const keys = await call.pubkeys();

  return { call, ...keys };
};

export const setProtocolFeeProportion = async (proportion: number) => {
  const call = await state.program.methods
    .setProtocolFeeProportion({ proportion: new BN(proportion) })
    .accounts({ pairMint: null });

  return { call };
};

export const setFeeReceiverAuthority = async (authority: PublicKey) => {
  const call = await state.program.methods
    .setFeeReceiverAuthority({ authority })
    .accounts({ pairMint: null });

  return { call };
};
