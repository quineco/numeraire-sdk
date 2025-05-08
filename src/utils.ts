import fs from "fs";
import {
  PublicKey,
  ComputeBudgetProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  Connection,
  Transaction,
  Keypair,
  AddressLookupTableAccount,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import IDL from "./idl/numeraire.json";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/base64";
import { IdlCoder } from "@coral-xyz/anchor/dist/cjs/coder/borsh/idl";
import { IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";
import { getPoolKeys } from "./getters";
import { AnchorProvider, setProvider, Program } from "@coral-xyz/anchor";
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
import { Numeraire } from "./idl/numeraire";
import { InitProps } from "./type";
import { addComputeInstructions } from "@solana-developers/helpers";
import { NORMALIZED_VALUE_DECIMALS, SYMPY_URL } from "./constant";

export const state: {
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
}: InitProps = {}) => {
  let envProvider;
  if (connection === undefined) {
    envProvider = AnchorProvider.env();
    connection = envProvider.connection;
  }

  state.wallet =
    payer === undefined ? envProvider?.wallet : new NodeWallet(payer);
  state.provider = new AnchorProvider(connection as any, state.wallet);
  state.program = new Program(IDL as Numeraire, state.provider);
  state.applyD = applyD;

  setProvider(state.provider);

  return state;
};

export const u64ToF64_LittleEndian = (u64: bigint) => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, u64, true); // Little Endian
  return view.getFloat64(0, true); // Little Endian
};

/**
 * Reinterpret cast a JavaScript Number (f64) to a BigInt (u64) using Little Endian.
 * @param {number} num - The floating-point number to convert.
 * @returns {BigInt} - The 64-bit unsigned integer representation.
 */
export const f64ToU64_LittleEndian = (num) => {
  const buffer = new ArrayBuffer(8); // 64 bits
  const view = new DataView(buffer);
  view.setFloat64(0, num, true); // true for Little Endian
  return view.getBigUint64(0, true).toString(); // true for Little Endian
};

export async function readOnly(
  instruction: TransactionInstruction,
  instructionName: string,
  connection: Connection
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
      log.startsWith(returnPrefix)
    );

    if (returnLogEntry) {
      base64 = decode(returnLogEntry.slice(returnPrefix.length)); // get the base64 of your return value
    }
  }
  if (!base64) return { value: null }; // if it doesn't exist, return null as well

  const coder = IdlCoder.fieldLayout(
    { type: returnType },
    Array.from([...(IDL.types ?? [])]) as IdlTypeDef[]
  );

  return { value: coder.decode(base64) }; // convert the base64 to the correct return type
}

/// If a given ata already exists, it will not be created again and the transaction will be free
export const createATAsForPoolsIfNeeded = async (
  pools: Record<string, string>
) => {
  for (const [poolName, poolAddress] of Object.entries(pools)) {
    const pool = await getPoolKeys(new PublicKey(poolAddress)).catch(
      (error) => {
        console.error(`Error processing pool ${poolName}:`, error);
        throw error; // Re-throw to trigger early return
      }
    );
    console.log(
      `Creating ATAs for ${poolName} for wallet ${state.wallet.publicKey.toString()}`
    );

    for (const pair of pool.pairs) {
      console.log(`Creating ATA for xMint: ${pair.xMint.toString()}`);

      const accountInfo = await state.provider.connection.getAccountInfo(
        pair.xMint
      );

      const ata = getAssociatedTokenAddressSync(
        pair.xMint,
        state.wallet.publicKey,
        false,
        accountInfo.owner,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const ix = createAssociatedTokenAccountIdempotentInstruction(
        state.wallet.publicKey, // payer
        ata, // ata
        state.wallet.publicKey, // owner
        pair.xMint, // mint
        accountInfo.owner // program id
      );

      const tx = new Transaction().add(ix);
      await state.provider.sendAndConfirm(tx).catch((error) => {
        console.error(
          `Error creating ATA for ${pair.xMint.toString()}:`,
          error
        );
        throw error;
      });
    }
    console.log(`Finished creatingATAs for ${poolName}`);
  }
  console.log(`Finished creatingATAs for all pools`);
};

export const decodeReturnData = (returnData: string) => {
  const base64 = decode(returnData);
  const coder = IdlCoder.fieldLayout(
    { type: "u64" },
    // @ts-ignore
    Array.from([...(IDL.accounts ?? [])])
  );
  return coder.decode(base64);
};

export const loadKeypairFromFile = (filename: string): Keypair => {
  const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
};

export const buildOptimalTransaction = async (
  connection: Connection,
  instructions: Array<TransactionInstruction>,
  payer: PublicKey,
  lookupTables: Array<AddressLookupTableAccount> = []
) => {
  const updatedInstructions = await addComputeInstructions(
    connection,
    instructions,
    lookupTables,
    payer,
    null,
    { multiplier: 1.1 } // compute unit buffer default adds 10%
  );

  const msg = new TransactionMessage({
    instructions: [...updatedInstructions],
    payerKey: payer,
    recentBlockhash: (await state.provider.connection.getLatestBlockhash())
      .blockhash,
  }).compileToV0Message(lookupTables);
  const tx = new VersionedTransaction(msg);
  return tx;
};

export const getTrueAlpha = async (A: number, a: number) => {
  // Calculate normalized values using the same logic as before
  const normalizedA = state.applyD
    ? A
    : A / Math.pow(10, NORMALIZED_VALUE_DECIMALS);
  const normalizedAb = state.applyD
    ? a
    : a / Math.pow(10, NORMALIZED_VALUE_DECIMALS);

  const url = SYMPY_URL(normalizedA, normalizedAb);

  try {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status}`);
    }

    const data = await result.json();

    return parseFloat(data["result"]);
  } catch (error) {
    console.error(`Error getting true alpha: ${error.message}`);
    throw error;
  }
};
