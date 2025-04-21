# Numeraire SDK

An SDK to build on top of Numeraire.

## Program ID

NUMERUNsFCP3kuNmWZuXtm1AaQCPj9uw6Guv2Ekoi5P

## User Guide

### Installation

```bash
# NPM
npm i @perena/numeraire-sdk
# YARN
yarn add @perena/numeraire-sdk
# Or, use any package manager of your choice.
```

Numéraire is Perena's stableswap AMM. It facilitates the launch, trading and liquidity provisioning of stablecoins by implementing composable, extensible pools and reducing idle-liquidity that exists in traditional AMM designs

This composable structure isolates risks and optimizes swaps by connecting established stablecoins with emerging ones. It consists in the combination of:

- **Seed Pool**
- **Growth Pools**.

## USD\* Price Calculation

The current price of USD\* can be calculated with the help of SDK by following steps:

- Simulate an **add_liquidity** call from the SDK with USDC, USDT, PYUSD on seed pool from an account
- Get the amount of USD\* minted during **add_liquidity** to that account
- Now, we have Total amount of tokens deposited and amount of USD\* minted during **add_liquidity**

```
USD_Star_Price = Total_Token_Deposited / USD_Star_Minted
```

The SDK provides you with off-chain helpers to call the Numéraire program.

## User Guide

While integrating with Numéraire program and in general to build a optimal transaction its important to simulate the transactions and to set a proper Compute Unit Price and Limit. [Guide](https://solana.com/developers/guides/advanced/how-to-request-optimal-compute) to build Optimal transaction on Solana using @solana-developers/helpers, or simply use the helper buildOptimalTransaction available in the SDK.

## Examples

### Swap

```ts
import { PublicKey } from "@solana/web3.js";
import { init, swapExactIn, PRODUCTION_POOLS } from "@perena/numeraire-sdk";

(async () => {
  let state = init({ applyD: false });
  console.log(state);

  const { call } = await swapExactIn({
    pool: new PublicKey(PRODUCTION_POOLS.susd),
    in: 1, // pair index of 'in' token, can also use the mint address as string
    out: 0, // pair index of 'out' token, can also use the mint address as string
    exactAmountIn: 100_000,
    minAmountOut: 99_000,
    cuLimit: 1500000,
  });
  console.log(await call.rpc());
})();
```

### Add liquidity

```ts
import { PublicKey } from "@solana/web3.js";
import {
  init,
  addLiquidity,
  loadKeypairFromFile,
  PRODUCTION_POOLS,
} from "@perena/numeraire-sdk";

(async () => {
  init({ payer: loadKeypairFromFile("./keypair.json") });

  const { call } = await addLiquidity({
    pool: new PublicKey(PRODUCTION_POOLS.tripool),
    maxAmountsIn: [15, 10, 10],
    minLpTokenMintAmount: 1,
    takeSwaps: true,
  });
  console.log(await call.rpc());
})();
```

### Remove liquidity

```ts
import { PublicKey } from "@solana/web3.js";
import { init, removeLiquidity, PRODUCTION_POOLS } from "@perena/numeraire-sdk";

(async () => {
  init({ applyD: false });

  const decimals = 6;
  const d = 10 ** decimals;
  const { call } = await removeLiquidity({
    pool: new PublicKey(PRODUCTION_POOLS.usds),
    lpTokenRedeemAmount: 15 * d,
  });
  console.log(await call.rpc());
})();
```
