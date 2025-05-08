import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import IDL from "./idl/numeraire.json";
export const multiSigAddress = new PublicKey(
  "CPJo7euWKrEETLmGJsctRnrXxbikFsb6KLN59moNN88K"
);
export const PRODUCTION_POOLS = {
  tripool: "2w4A1eGyjRutakyFdmVyBiLPf98qKxNTC2LpuwhaCruZ",
  susd: "4FxWowiGfd8oseveAdXYafzc3fczKda9zi65oj6jqbtL",
  usds: "3PHVBLYZnJE4SXEAJ6seQLhxNprpECgTfCot5XgVNUZ5",
  usdy: "Gi3dGkokskdTFP7k7cmLBdmdbsQzd6VQcMWo5VyU82BZ",
  ausd: "D99Hw2auf97WjzKPXZnpxTvJBt2TD6pPnk3a7uHceHqj",
  cfusd: "3jcCKowE3KdNro2QVETcVghGdTSQrCA7i9rbfZHhepEi",
  moveusd: "6rYsH85HXG7w7ZCtYRwfj4T2fsUdGtmWWo52hRGRuVNr",
  fdusd: "DvggYdonWQdygGvgtM5SrVLMhkYxgdTDr199yc673bF",
  usdg: "5M7McNWX7yBBGrZGB6XhmHYhFwWwwB2ckrA1HEpkf3SA",
};

export const STAGING_POOLS = {
  tripool: "4s6J4Wk4fksTZh96Fn2ozj4try4hDcwv5ZHUwY5qyEtm",
  yieldcoin: "5GSzTuWNuahkWAjK7W9seW2YDX5YWcURiLstynZfjBFH",
};

export const ID = new PublicKey(IDL.address);
export const NUMERAIRE_CONFIG_ID = PublicKey.findProgramAddressSync(
  [
    Buffer.from(
      JSON.parse(IDL.constants.find((x) => x.name == "CONFIG_SEED").value)
    ),
  ],
  ID
)[0];
export const LP_TOKEN_PROGRAM = TOKEN_PROGRAM_ID;
export const USE_ENTIRE_IN_ACCOUNT_AMOUNT = new BN("18446744073709551615");
export const NORMALIZED_VALUE_DECIMALS = parseInt(
  IDL.constants.find((x) => x.name === "NORMALIZED_VALUE_DECIMALS").value
);
export const MAX_STABLES_PER_POOL = parseInt(
  IDL.constants.find((x) => x.name == "MAX_STABLES_PER_POOL").value
);
export const DEFAULT_PUBLIC_KEY = new PublicKey(
  "5W7bRQhXZyGFhYt5eKU3zKFmAiCoV1hNRXcFWQYhp3tb"
);

export const LIQUIDITY_SEED = Buffer.from(
  JSON.parse(IDL.constants.find((x) => x.name == "LIQUIDITY_SEED").value)
);

export const SYMPY_URL = (normalizedA: number, normalizedAb: number) =>
  `https://sympy-eight.vercel.app/eval_ab?A=${normalizedA}&a=${normalizedAb}&apply_d=true`;
