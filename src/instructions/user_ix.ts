import {
  PublicKey,
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionInstruction,
  TransactionMessage,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { AddInfo, RemoveInfo, SwapInInfo } from "../type";
import {getLiqAccounts, getNumeraireConfig, getPoolKeys} from "../getters";
import {
  DEFAULT_PUBLIC_KEY,
  ID,
  LIQUIDITY_SEED,
  LP_TOKEN_PROGRAM,
  MAX_STABLES_PER_POOL,
  NORMALIZED_VALUE_DECIMALS,
  USE_ENTIRE_IN_ACCOUNT_AMOUNT,
} from "../constant";
import { state } from "../utils";
import { addComputeInstructions } from "@solana-developers/helpers";

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
      { isCompound: false } // explicitly specify this is not compound
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
      { isCompound: false } // explicitly specify this is not compound
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
  poolKeys = undefined
) => {
  const { accounts, remainingAccounts } = await getLiqAccounts(pool, poolKeys);
  const call = await state.program.methods
    .removeAllLiquidity()
    .accounts(accounts)
    .remainingAccounts(remainingAccounts);

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
      ID
    )[0],
    xVault: null,
    decimals,
    xIs2022: Number(
      LP_TOKEN_PROGRAM.toString() === TOKEN_2022_PROGRAM_ID.toString()
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
              : undefined
        );
  const outIndex =
    typeof outId === "number"
      ? outId
      : notNeg1(
          info.pairs.findIndex((p) => p.xMint.toString() === outId),
          () =>
            lpPair().xMint.toString() === outId
              ? MAX_STABLES_PER_POOL
              : undefined
        );

  const inPair =
    inIndex !== MAX_STABLES_PER_POOL ? info.pairs[inIndex] : lpPair();
  const outPair =
    outIndex !== MAX_STABLES_PER_POOL ? info.pairs[outIndex] : lpPair();

  const numeraireConfig = await getNumeraireConfig({ fetchWhitelistedAddr: false, fetchFeeReceiverAuthority: true });
  const feeReceiverAuthority = numeraireConfig["feeReceiverAuthority"];

  const feeReceiverAccount = getAssociatedTokenAddressSync(
      inPair.xMint,
      feeReceiverAuthority,
      true,
      inPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
  );


  const inD = state.applyD ? 10 ** inPair.decimals : 1;
  const outD = state.applyD ? 10 ** outPair.decimals : 1;
  const normD = state.applyD ? 10 ** NORMALIZED_VALUE_DECIMALS : 1;

  if (typeof inPair.xIs2022 !== "number" || typeof outPair.xIs2022 !== "number")
    throw new Error("xIs2022 is not a number");

  const exactAmountIn =
    exactAmountInInput == USE_ENTIRE_IN_ACCOUNT_AMOUNT
      ? USE_ENTIRE_IN_ACCOUNT_AMOUNT
      : typeof exactAmountInInput === "number"
      ? new BN(exactAmountInInput * inD)
      : exactAmountInInput.mul(new BN(inD));

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
          inPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
        ),
      outMint: outPair.xMint,
      outVault: outPair.xVault,
      outTrader:
        outTrader ??
        getAssociatedTokenAddressSync(
          outPair.xMint,
          state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
          true,
          outPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
        ),
      feeReceiver: feeReceiverAccount,
      payer: state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
    } as any)
    .preInstructions(preInstructions);

  return { call };
};

export const swapExactInOptimalCUTransaction = async (
  info: SwapInInfo,
  quote: boolean = false
) => {
  const {
    pool,
    exactAmountIn: exactAmountInInput,
    minAmountOut: minAmountOutInput,
    in: inId,
    out: outId,
    inTrader,
    outTrader,
    cuLimit = undefined,
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
      ID
    )[0],
    xVault: null,
    decimals,
    xIs2022: Number(
      LP_TOKEN_PROGRAM.toString() === TOKEN_2022_PROGRAM_ID.toString()
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
              : undefined
        );
  const outIndex =
    typeof outId === "number"
      ? outId
      : notNeg1(
          info.pairs.findIndex((p) => p.xMint.toString() === outId),
          () =>
            lpPair().xMint.toString() === outId
              ? MAX_STABLES_PER_POOL
              : undefined
        );

  const inPair =
    inIndex !== MAX_STABLES_PER_POOL ? info.pairs[inIndex] : lpPair();
  const outPair =
    outIndex !== MAX_STABLES_PER_POOL ? info.pairs[outIndex] : lpPair();

  const numeraireConfig = await getNumeraireConfig({ fetchWhitelistedAddr: false, fetchFeeReceiverAuthority: true });
  const feeReceiverAuthority = numeraireConfig["feeReceiverAuthority"];

  const feeReceiverAccount = getAssociatedTokenAddressSync(
      inPair.xMint,
      feeReceiverAuthority,
      true,
      inPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
  );

  const inD = state.applyD ? 10 ** inPair.decimals : 1;
  const outD = state.applyD ? 10 ** outPair.decimals : 1;
  const normD = state.applyD ? 10 ** NORMALIZED_VALUE_DECIMALS : 1;

  if (typeof inPair.xIs2022 !== "number" || typeof outPair.xIs2022 !== "number")
    throw new Error("xIs2022 is not a number");

  const exactAmountIn =
    exactAmountInInput == USE_ENTIRE_IN_ACCOUNT_AMOUNT
      ? USE_ENTIRE_IN_ACCOUNT_AMOUNT
      : typeof exactAmountInInput === "number"
      ? new BN(exactAmountInInput * inD)
      : exactAmountInInput.mul(new BN(inD));

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
  }).accounts({
    pool,
    inMint: inPair.xMint,
    inVault: inPair.xVault,
    inTrader:
      inTrader ??
      getAssociatedTokenAddressSync(
        inPair.xMint,
        state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
        true,
        inPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
      ),
    outMint: outPair.xMint,
    outVault: outPair.xVault,
    outTrader:
      outTrader ??
      getAssociatedTokenAddressSync(
        outPair.xMint,
        state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
        true,
        outPair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
      ),
    feeReceiver: feeReceiverAccount,
    payer: state.wallet ? state.wallet.publicKey : DEFAULT_PUBLIC_KEY,
  } as any);

  let swap_ix: TransactionInstruction[] = (await call.transaction())
    .instructions;
  let ixs: TransactionInstruction[];

  if (requireCuIx) {
    if (cuLimit == undefined) {
      ixs = await addComputeInstructions(
        state.provider.connection,
        swap_ix,
        [],
        state.wallet.publicKey,
        null,
        { multiplier: 1.1 } // compute unit buffer default adds 10%
      );
    } else {
      ixs = await addComputeInstructions(
        state.provider.connection,
        swap_ix,
        [],
        state.wallet.publicKey,
        null,
        { fixed: cuLimit }
      );
    }
  } else {
    ixs = swap_ix;
  }

  const msg = new TransactionMessage({
    instructions: [...ixs],
    payerKey: state.wallet.publicKey,
    recentBlockhash: (await state.provider.connection.getLatestBlockhash())
      .blockhash,
  }).compileToV0Message();
  const tx = new VersionedTransaction(msg);

  return tx;
};
