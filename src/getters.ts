import { EventParser, BorshCoder } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { Numeraire } from "./idl/numeraire";
import IDL from "./idl/numeraire.json";
import { Pair, PoolInfo } from "./type";
import { ID, MAX_STABLES_PER_POOL, NUMERAIRE_CONFIG_ID } from "./constant";
import { state } from "./utils";

export const getNumeraireConfig = async (fetchWhitelistedAddr = false) => {
  const conf = await state.program.account.numeraireConfig.fetch(
    NUMERAIRE_CONFIG_ID
  );

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
      conf["padding"].slice(0, 32)
    );
  }

  if ("padding" in conf) delete conf["padding"];

  return conf;
};

export const getPairState = async (pair: PublicKey) => {
  const p = (await state.program.account.virtualStablePair.fetch(
    pair
  )) as unknown as Pair;

  if ("padding" in p) delete p.padding;

  // @ts-expect-error it's bigint only for a tiny bit
  p.curveAlpha = u64ToF64_LittleEndian(p.curveAlpha);
  // @ts-expect-error ^^
  p.curveBeta = u64ToF64_LittleEndian(p.curveBeta);

  p.xVaultBalance = Number(
    (await state.provider.connection.getTokenAccountBalance(p.xVault)).value
      .amount
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
  accBuffer = undefined
): Promise<PoolInfo> => {
  let data;
  if (accBuffer === undefined) {
    data = await state.program.account.stablePool.fetch(pool);
  } else {
    data = state.program.coder.accounts.decode(
      "stablePool",
      Buffer.from(accBuffer, "base64")
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
  excludedTokens: number[] = []
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
            pair.xIs2022 === 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
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

export const getAnchorEventsFromLogs = (logs: string[]) => {
  const eventParser = new EventParser(ID, new BorshCoder(IDL as Numeraire));
  let events = [];
  for (const e of eventParser.parseLogs(logs)) events.push(e);
  return events;
};

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
