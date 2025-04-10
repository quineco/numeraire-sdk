import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { EventParser, BorshCoder } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  ComputeBudgetProgram,
  Keypair,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  Connection,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import { BN } from "bn.js";

import { Numeraire } from "./idl/numeraire";
import IDL from "./idl/numeraire.json";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/base64";
import { IdlCoder } from "@coral-xyz/anchor/dist/cjs/coder/borsh/idl";
import { IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";
import { MethodsBuilder } from "@coral-xyz/anchor/dist/cjs/program/namespace/methods";

const multiSigAddress = new PublicKey(
  "CPJo7euWKrEETLmGJsctRnrXxbikFsb6KLN59moNN88K",
);
if (process.env.NEXT_PUBLIC_NUMERAIRE_PROGRAM_ID) {
  IDL.address = process.env.NEXT_PUBLIC_NUMERAIRE_PROGRAM_ID;
}

export const PRODUCTION_POOLS = {
  tripool: "2w4A1eGyjRutakyFdmVyBiLPf98qKxNTC2LpuwhaCruZ",
  susd: "4FxWowiGfd8oseveAdXYafzc3fczKda9zi65oj6jqbtL",
  usds: "3PHVBLYZnJE4SXEAJ6seQLhxNprpECgTfCot5XgVNUZ5",
  usdy: "Gi3dGkokskdTFP7k7cmLBdmdbsQzd6VQcMWo5VyU82BZ",
  ausd: "D99Hw2auf97WjzKPXZnpxTvJBt2TD6pPnk3a7uHceHqj",
  cfusd: "3jcCKowE3KdNro2QVETcVghGdTSQrCA7i9rbfZHhepEi",
};

export const STAGING_POOLS = {
  tripool: "4s6J4Wk4fksTZh96Fn2ozj4try4hDcwv5ZHUwY5qyEtm",
  yieldcoin: "5GSzTuWNuahkWAjK7W9seW2YDX5YWcURiLstynZfjBFH",
};

export const ID = new PublicKey(IDL.address);
export const NUMERAIRE_CONFIG_ID = PublicKey.findProgramAddressSync(
  [
    Buffer.from(
      JSON.parse(IDL.constants.find((x) => x.name == "CONFIG_SEED").value),
    ),
  ],
  ID,
)[0];
export const LP_TOKEN_PROGRAM = TOKEN_PROGRAM_ID;
export const USE_ENTIRE_IN_ACCOUNT_AMOUNT = new BN("18446744073709551615");
export const NORMALIZED_VALUE_DECIMALS = parseInt(
  IDL.constants.find((x) => x.name === "NORMALIZED_VALUE_DECIMALS").value,
);
export const MAX_STABLES_PER_POOL = parseInt(
  IDL.constants.find((x) => x.name == "MAX_STABLES_PER_POOL").value,
);
export const DEFAULT_PUBLIC_KEY = new PublicKey(
  "5W7bRQhXZyGFhYt5eKU3zKFmAiCoV1hNRXcFWQYhp3tb",
);

const LIQUIDITY_SEED = Buffer.from(
  JSON.parse(IDL.constants.find((x) => x.name == "LIQUIDITY_SEED").value),
);

interface PairInfo {
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

interface AddInfo {
  pool: PublicKey;
  maxAmountsIn: number[];
  minLpTokenMintAmount: number;
  takeSwaps: boolean;
  swapPaths?: number[];
  swapAmounts?: number[];
  requireCuIx?: boolean;
  cuLimit?: number;
}

interface RemoveInfo {
  pool: PublicKey;
  lpTokenRedeemAmount: number;
  minAmountsOut?: number[];
  out?: number | string;
  requireCuIx?: boolean;
  cuLimit?: number;
}

interface SwapInInfo {
  pool: PublicKey;
  in: number | string;
  out: number | string;
  // @ts-expect-error
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

interface SwapOutInfo {
  pool: PublicKey;
  in: number | string;
  out: number | string;
  exactAmountOut: number;
  maxAmountIn: number;
  hints?: number[];
  pairs?: Pair[];
}

const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;

const state: {
  wallet: typeof NodeWallet;
  provider: AnchorProvider;
  program: Program<Numeraire>;
  applyD: boolean;
} = {
  wallet: undefined,
  provider: undefined,
  program: undefined,
  applyD: undefined,
};

export const init = ({
  payer = undefined,
  applyD = true,
  connection = undefined,
} = {}) => {
  let envProvider;
  if (connection === undefined) {
    envProvider = AnchorProvider.env();
    connection = envProvider.connection;
  }

  state.wallet =
    payer === undefined ? envProvider?.wallet : new NodeWallet(payer);
  state.provider = new AnchorProvider(connection, state.wallet);
  state.program = new Program(IDL as Numeraire, state.provider);
  state.applyD = applyD;

  setProvider(state.provider);

  return state;
};

/**
 * Reinterpret cast a JavaScript Number (f64) to a BigInt (u64) using Little Endian.
 * @param {number} num - The floating-point number to convert.
 * @returns {BigInt} - The 64-bit unsigned integer representation.
 */
export function f64ToU64_LittleEndian(num) {
  const buffer = new ArrayBuffer(8); // 64 bits
  const view = new DataView(buffer);
  view.setFloat64(0, num, true); // true for Little Endian
  return view.getBigUint64(0, true).toString(); // true for Little Endian
}

const { exec } = require("child_process");

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
  send = true,
): Promise<Pair> => {
  if (typeof decimals !== "number") throw new Error("Decimals required");
  const d = state.applyD ? 10 ** decimals : 1;

  if (a !== b || beta !== 1 / alpha) throw new Error("need a=b");

  let trueAlpha: number = await new Promise((res, err) => {
    // Define your Python code as a template literal
    const pythonCode = `
from sympy import factor, simplify, idiff, solve
from sympy.abc import x, y, A, a, b

def eval_ab(Aval: float, ab: float):
    invar = x - A / (x + a) + y - A / (y + b) - (2 - A / (1 + a) - A / (1 + b))
    when_eq = invar.subs(b, a)
    p_x_when_eq = factor(simplify(idiff(when_eq, y, x)), deep=True).subs(a**2 + 2*a*y + y**2, (y + a)**2)

    ysol = solve(when_eq.subs(x, 0).subs(A, Aval), y)[1]

    res = -1 * p_x_when_eq.subs(x, 0).subs(y, ysol).evalf(subs={ A: Aval, a: ab })
    return 1 / res

# Note: this line below is not equivalent to A * dNorm, it is doing the opposite
print(eval_ab(${state.applyD ? A : A / 10 ** NORMALIZED_VALUE_DECIMALS}, ${
      state.applyD ? a : a / 10 ** NORMALIZED_VALUE_DECIMALS
    }))
`;
    const cmd = `python3 -c ${JSON.stringify(pythonCode)}`.replace(
      /\\n/g,
      "\n",
    );

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return err(error);
      }

      if (stderr) {
        console.error(`Standard Error: ${stderr}`);
        return err(stderr);
      }

      return res(parseFloat(stdout));
    });
  });

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
          multiSigAddress,
          true,
          spl_2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
        ),
      payer: multiSigAddress,
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
  useAnchor = false,
) => {
  const { poolSeed, invT, feeNum, feeDenom, decimals } = info;
  const d = state.applyD ? 10 ** decimals : 1;
  if (info.pairInfo !== undefined && pairs.length != 0)
    throw new Error("Provide one of undeployed pair infos or deployed pairs");

  const instrs = [];
  for (const p of info.pairInfo === undefined ? [] : info.pairInfo) {
    const { call, ...pair } = await createPair(
      { decimals: p.decimals === undefined ? decimals : p.decimals, ...p },
      useAnchor,
    );
    pairs.push(pair);

    if (useAnchor) {
      await call.rpc();
    } else {
      instrs.push(...(await call.transaction()).instructions);
    }
  }

  const remainingAccounts = [];
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
    const signedTransaction =
      await state.provider.wallet.signTransaction(transaction);
    const txHash = await state.provider.connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        maxRetries: 20,
      },
    );
    await state.provider.connection.confirmTransaction(txHash, "confirmed");
    return txHash;
  }
  return { call: { rpc }, pool, pairs };
};

export const getNumeraireConfig = async (fetchWhitelistedAddr = false) => {
  const conf =
    await state.program.account.numeraireConfig.fetch(NUMERAIRE_CONFIG_ID);

  // decode rates
  const rates = [];
  let seenDef = false;
  let i = -1;
  for (const r of conf.rateMints) {
    i++;
    if (r.toString() === PublicKey.default.toString()) {
      seenDef = true;
      continue;
    }
    if (seenDef) throw new Error("");

    rates.push({
      mint: r.toString(),
      num: conf.rateNums[i],
      denom: conf.rateDenoms[i],
    });
  }
  delete conf.rateMints;
  delete conf.rateNums;
  delete conf.rateDenoms;

  conf["rates"] = rates;

  if (fetchWhitelistedAddr) {
    conf["poolWhitelistedCreator"] = new PublicKey(
      conf["padding"].slice(0, 32),
    );
  }

  if ("padding" in conf) delete conf["padding"];

  return conf;
};

export const getPairState = async (pair: PublicKey) => {
  const p = (await state.program.account.virtualStablePair.fetch(
    pair,
  )) as unknown as Pair;

  if ("padding" in p) delete p.padding;

  // @ts-expect-error it's bigint only for a tiny bit
  p.curveAlpha = u64ToF64_LittleEndian(p.curveAlpha);
  // @ts-expect-error ^^
  p.curveBeta = u64ToF64_LittleEndian(p.curveBeta);

  p.xVaultBalance = Number(
    (await state.provider.connection.getTokenAccountBalance(p.xVault)).value
      .amount,
  );

  const bnProto = BN.prototype.toJSON;
  BN.prototype.toJSON = function () {
    return this.toString();
  };
  const str = JSON.stringify(p, null, 4);
  BN.prototype.toJSON = bnProto;

  return str;
};

export const getPoolKeys = async (
  pool: PublicKey,
  all = false,
  accBuffer = undefined,
): Promise<PoolInfo> => {
  let data;
  if (accBuffer === undefined) {
    data = await state.program.account.stablePool.fetch(pool);
  } else {
    data = state.program.coder.accounts.decode(
      "stablePool",
      Buffer.from(accBuffer, "base64"),
    );
  }

  data.pairs = data.pairs.slice(0, data.numStables);
  data.weights = data.weights.slice(0, data.numStables);

  for (const p of data.pairs) {
    if (p.pairIndex == MAX_STABLES_PER_POOL) break;

    if (all) {
      p.xVaultBalance = (
        await state.provider.connection.getTokenAccountBalance(p.xVault)
      ).value.amount;
    }
  }

  return { pool, ...data };
};

export const getLiqAccounts = async (
  pool: PublicKey,
  poolKeys = undefined,
  excludedTokens: number[] = [],
) => {
  const poolData = poolKeys || (await getPoolKeys(pool));

  const accounts = {
    pool,
    payer: state.wallet.publicKey,
  };

  const remainingAccounts = [];

  for (let i = 0; i < poolData.numStables; i++) {
    const pair = poolData.pairs[i];

    if (typeof pair.xIs2022 !== "number")
      throw new Error("xIs2022 is not a number");

    remainingAccounts.push({
      pubkey: pair.xVault,
      isSigner: false,
      isWritable: true,
    });
    remainingAccounts.push({
      pubkey: excludedTokens.includes(i)
        ? ID // this is interpreted as "NONE" by anchor to prevent needing ATAs for tokens the user doesnt have accounts for
        : getAssociatedTokenAddressSync(
            pair.xMint,
            state.wallet.publicKey,
            true,
            pair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID,
          ),
      isSigner: false,
      isWritable: true,
    });
    remainingAccounts.push({
      pubkey: pair.xMint,
      isSigner: false,
      isWritable: false,
    });
  }

  return { accounts, pool: poolData, remainingAccounts };
};

export const addLiquidity = async (info: AddInfo) => {
  const {
    pool: poolKey,
    maxAmountsIn,
    minLpTokenMintAmount,
    takeSwaps,
    requireCuIx = true,
    cuLimit = 1400000,
  } = info;
  const excludedTokens = [];
  for (let i = 0; i < maxAmountsIn.length; i++) {
    if (maxAmountsIn[i] === 0) excludedTokens.push(i);
  }

  const { accounts, pool, remainingAccounts } = await getLiqAccounts(
    poolKey,
    undefined,
    excludedTokens,
  );

  const maxAmountsInBN = [];
  for (let i = 0; i < 10; i++) maxAmountsInBN.push(new BN(0));
  for (let i = 0; i < maxAmountsIn.length; i++) {
    if (maxAmountsIn[i] === 0) {
      maxAmountsInBN[i] = new BN(0);
    } else {
      const d = state.applyD ? 10 ** pool.pairs[i].decimals : 1;
      maxAmountsInBN[i] = new BN(maxAmountsIn[i] * d);
    }
  }

  if ((info.swapAmounts === undefined) != (info.swapPaths === undefined))
    throw new Error("");

  const swapAmounts = Array(MAX_STABLES_PER_POOL).fill(new BN(0));
  const swapPaths = Array(MAX_STABLES_PER_POOL).fill(0);
  if (info.swapAmounts !== undefined) {
    if (info.swapPaths.length !== info.swapAmounts.length) throw new Error("");
    for (let i = 0; i < info.swapAmounts.length; i++) {
      swapPaths[i] = info.swapPaths[i];
      const d = state.applyD ? 10 ** pool.pairs[i].decimals : 1;
      swapAmounts[i] = new BN(info.swapAmounts[i] * d);
    }
  }

  const poolD = state.applyD ? 10 ** pool.decimals : 1;

  const preInstructions = requireCuIx
    ? [ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit })]
    : [];

  const call = state.program.methods
    .addLiquidity({
      maxAmountsIn: maxAmountsInBN,
      minLpTokenMintAmount: new BN(minLpTokenMintAmount * poolD),
      takeSwaps: takeSwaps ? 1 : 0,
      swapPaths,
      swapAmounts,
    })
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .preInstructions(preInstructions);

  return { call };
};

export const removeLiquidity = async (info: RemoveInfo) => {
  const {
    pool: poolKey,
    lpTokenRedeemAmount,
    out,
    requireCuIx = true,
    cuLimit = 1400000,
  } = info;
  const poolKeys = await getPoolKeys(poolKey);
  const outIndex =
    out === undefined
      ? MAX_STABLES_PER_POOL
      : typeof out === "number"
        ? out
        : poolKeys.pairs.findIndex((p) => p.xMint.toString() === out);

  const excludedTokens = poolKeys.pairs
    .map((p, i) => (i === outIndex ? undefined : i))
    .filter((i) => i !== undefined);

  const { accounts, pool, remainingAccounts } = await getLiqAccounts(
    poolKey,
    poolKeys,
    outIndex === MAX_STABLES_PER_POOL ? [] : excludedTokens,
  );

  const minAmountsOut = Array(MAX_STABLES_PER_POOL).fill(new BN(0));
  if (info.minAmountsOut !== undefined)
    for (let i = 0; i < info.minAmountsOut.length; i++) {
      const d = state.applyD ? 10 ** pool.pairs[i].decimals : 1;
      minAmountsOut[i] = new BN(info.minAmountsOut[i] * d);
    }

  const poolD = state.applyD ? 10 ** pool.decimals : 1;
  const preInstructions = requireCuIx
    ? [ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit })]
    : [];
  const call = await state.program.methods
    .removeLiquidity({
      lpTokenRedeemAmount: new BN(lpTokenRedeemAmount * poolD),
      minAmountsOut,
      outIndex,
    })
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .preInstructions(preInstructions);

  return { call };
};

export const removeAllLiquidity = async (
  { pool }: { pool: PublicKey },
  poolKeys = undefined,
) => {
  const { accounts, remainingAccounts } = await getLiqAccounts(pool, poolKeys);
  const call = await state.program.methods
    .removeAllLiquidity()
    .accounts(accounts)
    .remainingAccounts(remainingAccounts);

  return { call };
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
  creator: PublicKey,
) => {
  const call = await state.program.methods
    .setNumeraireWhitelistedPoolCreator({ whitelistedAddr: creator })
    .accounts({ pairMint: null });

  return { call };
};

export const swapExactIn = async (info: SwapInInfo, quote: boolean = false) => {
  const {
    pool,
    exactAmountIn: exactAmountInInput,
    minAmountOut: minAmountOutInput,
    in: inId,
    out: outId,
    inTrader,
    outTrader,
    cuLimit = 1400000,
    requireCuIx = true,
    decimals,
  } = info;
  if (info.pairs === undefined) info.pairs = (await getPoolKeys(pool)).pairs;
  if (info.hints === undefined)
    info.hints = Array(MAX_STABLES_PER_POOL).fill(0);

  if (info.hints.length !== 4 && info.hints.length !== 10)
    throw new Error("Hints should be length 4/10 number array");

  const hinted = info.hints.some((h) => h !== 0);

  const lpPair = () => ({
    xMint: PublicKey.findProgramAddressSync(
      [pool.toBuffer(), LIQUIDITY_SEED],
      ID,
    )[0],
    xVault: null,
    decimals,
    xIs2022: Number(
      LP_TOKEN_PROGRAM.toString() === TOKEN_2022_PROGRAM_ID.toString(),
    ),
  });

  const notNeg1 = (v, otherwise) => (v !== -1 ? v : otherwise());

  const inIndex =
    typeof inId === "number"
      ? inId
      : notNeg1(
          info.pairs.findIndex((p) => p.xMint.toString() === inId),
          () =>
            lpPair().xMint.toString() === inId
              ? MAX_STABLES_PER_POOL
              : undefined,
        );
  const outIndex =
    typeof outId === "number"
      ? outId
      : notNeg1(
          info.pairs.findIndex((p) => p.xMint.toString() === outId),
          () =>
            lpPair().xMint.toString() === outId
              ? MAX_STABLES_PER_POOL
              : undefined,
        );

  const inPair =
    inIndex !== MAX_STABLES_PER_POOL ? info.pairs[inIndex] : lpPair();
  const outPair =
    outIndex !== MAX_STABLES_PER_POOL ? info.pairs[outIndex] : lpPair();

  const inD = state.applyD ? 10 ** inPair.decimals : 1;
  const outD = state.applyD ? 10 ** outPair.decimals : 1;
  const normD = state.applyD ? 10 ** NORMALIZED_VALUE_DECIMALS : 1;

  if (typeof inPair.xIs2022 !== "number" || typeof outPair.xIs2022 !== "number")
    throw new Error("xIs2022 is not a number");

  const exactAmountIn =
    exactAmountInInput == USE_ENTIRE_IN_ACCOUNT_AMOUNT
      ? USE_ENTIRE_IN_ACCOUNT_AMOUNT
      : new BN(exactAmountInInput * inD);

  const minAmountOut = new BN(minAmountOutInput * outD);

  const preInstructions = requireCuIx
    ? [ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit })]
    : [];

  const method = `swapExactIn${quote ? "Quote" : hinted ? "Hinted" : ""}`;
  const call = await state.program.methods[method]({
    exactAmountIn,
    minAmountOut,
    inIndex,
    outIndex,
    ...(quote || hinted
      ? {
          hints: [
            ...info.hints.map((h) => new BN(h * normD)),
            ...Array(MAX_STABLES_PER_POOL - info.hints.length).fill(new BN(0)),
          ],
          pathHints: Array(MAX_STABLES_PER_POOL).fill(0),
        }
      : {}),
  })
    .accounts({
      pool,
      inMint: inPair.xMint,
      inVault: inPair.xVault,
      inTrader:
        inTrader ??
        getAssociatedTokenAddressSync(
          inPair.xMint,
          state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
          true,
          inPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID,
        ),
      outMint: outPair.xMint,
      outVault: outPair.xVault,
      outTrader:
        outTrader ??
        getAssociatedTokenAddressSync(
          outPair.xMint,
          state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
          true,
          outPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID,
        ),
      payer: state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
    } as any)
    .preInstructions(preInstructions);

  return { call };
};

export function u64ToF64_LittleEndian(u64: bigint) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, u64, true); // Little Endian
  return view.getFloat64(0, true); // Little Endian
}

export const getPoolState = async (poolKey: PublicKey) => {
  const bnProto = BN.prototype.toJSON;
  BN.prototype.toJSON = function () {
    return this.toString();
  };
  const pool = await getPoolKeys(new PublicKey(poolKey), true);

  if ("padding" in pool) delete pool.padding;

  const numPairs = pool.numStables;

  pool.pairs = pool.pairs.slice(0, numPairs);
  pool.weights = pool.weights.slice(0, numPairs);

  for (const pair of pool.pairs) {
    if ("padding" in pair) delete pair["padding"];
    // @ts-expect-error temp bigint
    pair.curveAlpha = u64ToF64_LittleEndian(pair.curveAlpha);
    // @ts-expect-error temp bigint
    pair.curveBeta = u64ToF64_LittleEndian(pair.curveBeta);
  }

  try {
    const config = await getNumeraireConfig();
    console.log(JSON.stringify(config, null, 4));
  } catch (e) {
    console.log(null);
  }

  const str = JSON.stringify(pool, null, 4);
  BN.prototype.toJSON = bnProto;

  return str;
};

export async function readOnly(
  instruction: TransactionInstruction,
  instructionName: string,
  connection: Connection,
): Promise<{ value: any }> {
  // Filter through your IDL to get the actual read instruction schema and return type
  const ixx = IDL.instructions.find((i) => i.name == instructionName);

  // This checks if the instruction contains Mutable account, if it does, then it isn't a read only instruction
  const isMut = ixx && [...ixx.accounts].find((a: any) => a.isMut);
  const returnType = ixx && (ixx as any).returns;
  if (isMut || !returnType) return { value: null }; // basically return null value if ix is mutable or it doesn't contain a return type

  const { blockhash } = await connection.getLatestBlockhash(); // Fetch recent block

  const msg = new TransactionMessage({
    instructions: [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }),
      instruction,
    ],
    payerKey: state.wallet.publicKey,
    recentBlockhash: blockhash,
  }).compileToV0Message();
  const tx = new VersionedTransaction(msg);

  // Simulate tx (This wouldn't ask for the pop up confirmation)
  const sim = await connection.simulateTransaction(tx);

  if (sim.value.err) {
    // Handle Error
    throw new Error("Error");
  }

  let base64: Buffer | null = null;

  if (sim.value.returnData?.data) {
    base64 = decode(sim.value.returnData.data[0]); // get the base64 of your return value
  } else {
    // Read through all the transaction logs.
    const returnPrefix = `Program return: ${this.program.programId} `;
    const returnLogEntry = sim.value.logs!.find((log) =>
      log.startsWith(returnPrefix),
    );

    if (returnLogEntry) {
      base64 = decode(returnLogEntry.slice(returnPrefix.length)); // get the base64 of your return value
    }
  }
  if (!base64) return { value: null }; // if it doesn't exist, return null as well

  const coder = IdlCoder.fieldLayout(
    { type: returnType },
    Array.from([...(IDL.types ?? [])]) as IdlTypeDef[],
  );

  return { value: coder.decode(base64) }; // convert the base64 to the correct return type
}

export function decodeReturnData(returnData: string) {
  const base64 = decode(returnData);
  const coder = IdlCoder.fieldLayout(
    { type: "u64" },
    // @ts-ignore
    Array.from([...(IDL.accounts ?? [])]),
  );
  return coder.decode(base64);
}

export const getAnchorEventsFromLogs = (logs: string[]) => {
  const eventParser = new EventParser(ID, new BorshCoder(IDL as Numeraire));
  let events = [];
  for (const e of eventParser.parseLogs(logs)) events.push(e);
  return events;
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
  const { accounts, remainingAccounts } = await getLiqAccounts(pool);

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

/// If a given ata already exists, it will not be created again and the transaction will be free
export const createATAsForPoolsIfNeeded = async (
  pools: Record<string, string>,
) => {
  for (const [poolName, poolAddress] of Object.entries(pools)) {
    const pool = await getPoolKeys(new PublicKey(poolAddress)).catch(
      (error) => {
        console.error(`Error processing pool ${poolName}:`, error);
        throw error; // Re-throw to trigger early return
      },
    );
    console.log(
      `Creating ATAs for ${poolName} for wallet ${state.wallet.publicKey.toString()}`,
    );

    for (const pair of pool.pairs) {
      console.log(`Creating ATA for xMint: ${pair.xMint.toString()}`);

      const accountInfo = await state.provider.connection.getAccountInfo(
        pair.xMint,
      );

      const ata = getAssociatedTokenAddressSync(
        pair.xMint,
        state.wallet.publicKey,
        false,
        accountInfo.owner,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const ix = createAssociatedTokenAccountIdempotentInstruction(
        state.wallet.publicKey, // payer
        ata, // ata
        state.wallet.publicKey, // owner
        pair.xMint, // mint
        accountInfo.owner, // program id
      );

      const tx = new Transaction().add(ix);
      await state.provider.sendAndConfirm(tx).catch((error) => {
        console.error(
          `Error creating ATA for ${pair.xMint.toString()}:`,
          error,
        );
        throw error;
      });
    }
    console.log(`Finished creatingATAs for ${poolName}`);
  }
  console.log(`Finished creatingATAs for all pools`);
};
