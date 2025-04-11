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
import {
  MAX_STABLES_PER_POOL,
  multiSigAddress,
  NORMALIZED_VALUE_DECIMALS,
} from "./../constant";
import { MyAccount, Pair, PairInfo, PoolInfo } from "../type";
import { f64ToU64_LittleEndian, state } from "../utils";
import { getLiqAccounts } from "../getters";
import { exec } from "child_process";

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
