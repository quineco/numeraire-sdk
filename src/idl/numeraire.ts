/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/numeraire.json`.
 */
export type Numeraire = {
  address: "NUMERUNsFCP3kuNmWZuXtm1AaQCPj9uw6Guv2Ekoi5P";
  metadata: {
    name: "numeraire";
    version: "0.1.3";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addLiquidity";
      discriminator: [181, 157, 89, 67, 143, 182, 52, 72];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "payerLpAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "addLiquidityData";
            };
          };
        }
      ];
      returns: "u64";
    },
    {
      name: "compound";
      discriminator: [165, 208, 251, 78, 242, 160, 141, 47];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "payerLpAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        }
      ];
      args: [];
    },
    {
      name: "createPool";
      discriminator: [233, 146, 209, 142, 207, 104, 64, 188];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "arg";
                path: "data.pool_seed";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "creatorLpAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "tokenProgram2022";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "createStablePoolData";
            };
          };
        }
      ];
    },
    {
      name: "initVirtualStablePair";
      discriminator: [228, 18, 163, 161, 101, 204, 106, 172];
      accounts: [
        {
          name: "xMint";
        },
        {
          name: "pair";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "xMint";
              },
              {
                kind: "arg";
                path: "data.pair_seed";
              }
            ];
          };
        },
        {
          name: "pairAuthority";
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pair";
              },
              {
                kind: "const";
                value: [97, 117, 116, 104, 111, 114, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "xVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pair";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "xAdder";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "xMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "initVirtualStablePairData";
            };
          };
        }
      ];
    },
    {
      name: "removeAllLiquidity";
      discriminator: [10, 51, 61, 35, 112, 105, 24, 85];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "payerLpAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        }
      ];
      args: [];
    },
    {
      name: "removeLiquidity";
      discriminator: [80, 85, 209, 72, 24, 206, 177, 108];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "payerLpAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "removeLiquidityData";
            };
          };
        }
      ];
      returns: "u64";
    },
    {
      name: "setBondingCurveParametersForPair";
      discriminator: [243, 141, 229, 43, 185, 141, 8, 133];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setBondingCurveData";
            };
          };
        }
      ];
    },
    {
      name: "setFee";
      discriminator: [18, 154, 24, 18, 237, 214, 19, 80];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setFeeData";
            };
          };
        }
      ];
    },
    {
      name: "setFeeReceiverAuthority";
      discriminator: [101, 188, 124, 75, 205, 8, 28, 114];
      accounts: [
        {
          name: "numeraireConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pairMint";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Solana ecosystem accounts"];
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setFeeReceiverAuthorityData";
            };
          };
        }
      ];
    },
    {
      name: "setInvTMax";
      discriminator: [218, 209, 244, 237, 211, 236, 98, 58];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setInvTMaxData";
            };
          };
        }
      ];
    },
    {
      name: "setLpTokenMetadata";
      discriminator: [71, 73, 56, 155, 202, 142, 100, 150];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "metadataAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "account";
                path: "tokenMetadataProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "account";
              path: "tokenMetadataProgram";
            };
          };
        },
        {
          name: "payer";
          signer: true;
        },
        {
          name: "tokenMetadataProgram";
          docs: ["Solana ecosystem accounts"];
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "instructions";
          address: "Sysvar1nstructions1111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setMetadataData";
            };
          };
        }
      ];
    },
    {
      name: "setNumeraireOwner";
      discriminator: [6, 199, 177, 104, 86, 61, 93, 253];
      accounts: [
        {
          name: "numeraireConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pairMint";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Solana ecosystem accounts"];
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setOwnerData";
            };
          };
        }
      ];
    },
    {
      name: "setNumeraireStatus";
      discriminator: [10, 17, 5, 71, 204, 171, 126, 173];
      accounts: [
        {
          name: "numeraireConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pairMint";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Solana ecosystem accounts"];
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setStatusData";
            };
          };
        }
      ];
    },
    {
      name: "setNumeraireWhitelistedPoolCreator";
      discriminator: [147, 51, 31, 255, 111, 2, 189, 173];
      accounts: [
        {
          name: "numeraireConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pairMint";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Solana ecosystem accounts"];
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setWhilelistedAddrData";
            };
          };
        }
      ];
    },
    {
      name: "setOwner";
      discriminator: [72, 202, 120, 52, 77, 128, 96, 197];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setOwnerData";
            };
          };
        }
      ];
    },
    {
      name: "setProtocolFeeProportion";
      discriminator: [206, 199, 239, 77, 173, 101, 123, 224];
      accounts: [
        {
          name: "numeraireConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pairMint";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Solana ecosystem accounts"];
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setProtocolFeeProportionData";
            };
          };
        }
      ];
    },
    {
      name: "setRate";
      discriminator: [99, 58, 170, 238, 160, 120, 74, 11];
      accounts: [
        {
          name: "numeraireConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pairMint";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Solana ecosystem accounts"];
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setRateData";
            };
          };
        }
      ];
    },
    {
      name: "setStatus";
      discriminator: [181, 184, 224, 203, 193, 29, 177, 224];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setStatusData";
            };
          };
        }
      ];
    },
    {
      name: "setWeights";
      discriminator: [25, 58, 193, 19, 186, 84, 236, 187];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setWeightsData";
            };
          };
        }
      ];
    },
    {
      name: "setWhitelistedAdder";
      discriminator: [74, 38, 140, 129, 228, 73, 236, 105];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "setWhilelistedAddrData";
            };
          };
        }
      ];
    },
    {
      name: "skim";
      discriminator: [238, 120, 221, 138, 82, 60, 100, 218];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lpMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "const";
                value: [108, 105, 113, 117, 105, 100, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "payerLpAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "lpMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        }
      ];
      args: [];
    },
    {
      name: "swapExactIn";
      discriminator: [104, 104, 131, 86, 161, 189, 180, 216];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "inMint";
          writable: true;
        },
        {
          name: "outMint";
          writable: true;
        },
        {
          name: "inTrader";
          writable: true;
        },
        {
          name: "outTrader";
          writable: true;
        },
        {
          name: "inVault";
          writable: true;
          optional: true;
        },
        {
          name: "outVault";
          writable: true;
          optional: true;
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          docs: [
            "The trader account (executing the swap, paying for all rents)"
          ];
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "feeReceiver";
          writable: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "swapExactInHintlessData";
            };
          };
        }
      ];
      returns: "u64";
    },
    {
      name: "swapExactInHinted";
      discriminator: [98, 239, 244, 233, 16, 236, 40, 49];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "inMint";
          writable: true;
        },
        {
          name: "outMint";
          writable: true;
        },
        {
          name: "inTrader";
          writable: true;
        },
        {
          name: "outTrader";
          writable: true;
        },
        {
          name: "inVault";
          writable: true;
          optional: true;
        },
        {
          name: "outVault";
          writable: true;
          optional: true;
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          docs: [
            "The trader account (executing the swap, paying for all rents)"
          ];
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "feeReceiver";
          writable: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "swapExactInData";
            };
          };
        }
      ];
      returns: "u64";
    },
    {
      name: "swapExactInQuote";
      discriminator: [68, 209, 177, 170, 185, 100, 29, 191];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "inMint";
          writable: true;
        },
        {
          name: "outMint";
          writable: true;
        },
        {
          name: "inTrader";
          writable: true;
        },
        {
          name: "outTrader";
          writable: true;
        },
        {
          name: "inVault";
          writable: true;
          optional: true;
        },
        {
          name: "outVault";
          writable: true;
          optional: true;
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          docs: [
            "The trader account (executing the swap, paying for all rents)"
          ];
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "feeReceiver";
          writable: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "swapExactInData";
            };
          };
        }
      ];
      returns: "u64";
    },
    {
      name: "swapExactOut";
      discriminator: [250, 73, 101, 33, 38, 207, 75, 184];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "inMint";
          writable: true;
        },
        {
          name: "outMint";
          writable: true;
        },
        {
          name: "inTrader";
          writable: true;
        },
        {
          name: "outTrader";
          writable: true;
        },
        {
          name: "inVault";
          writable: true;
          optional: true;
        },
        {
          name: "outVault";
          writable: true;
          optional: true;
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          docs: [
            "The trader account (executing the swap, paying for all rents)"
          ];
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "feeReceiver";
          writable: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "swapExactOutHintlessData";
            };
          };
        }
      ];
      returns: "u64";
    },
    {
      name: "swapExactOutHinted";
      discriminator: [153, 208, 206, 70, 62, 234, 98, 182];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "inMint";
          writable: true;
        },
        {
          name: "outMint";
          writable: true;
        },
        {
          name: "inTrader";
          writable: true;
        },
        {
          name: "outTrader";
          writable: true;
        },
        {
          name: "inVault";
          writable: true;
          optional: true;
        },
        {
          name: "outVault";
          writable: true;
          optional: true;
        },
        {
          name: "numeraireConfig";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "payer";
          docs: [
            "The trader account (executing the swap, paying for all rents)"
          ];
          signer: true;
        },
        {
          name: "tokenProgram";
          docs: ["Solana ecosystem accounts"];
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "feeReceiver";
          writable: true;
        }
      ];
      args: [
        {
          name: "data";
          type: {
            defined: {
              name: "swapExactOutData";
            };
          };
        }
      ];
      returns: "u64";
    }
  ];
  accounts: [
    {
      name: "numeraireConfig";
      discriminator: [230, 62, 124, 43, 102, 101, 88, 63];
    },
    {
      name: "stablePool";
      discriminator: [239, 91, 93, 162, 171, 14, 42, 66];
    },
    {
      name: "virtualStablePair";
      discriminator: [112, 153, 135, 223, 53, 247, 129, 101];
    }
  ];
  events: [
    {
      name: "addLiquidity";
      discriminator: [31, 94, 125, 90, 227, 52, 61, 186];
    },
    {
      name: "quote";
      discriminator: [133, 244, 92, 134, 193, 24, 187, 158];
    },
    {
      name: "removeLiquidity";
      discriminator: [116, 244, 97, 232, 103, 31, 152, 58];
    },
    {
      name: "swapExactIn";
      discriminator: [147, 136, 213, 11, 150, 23, 141, 152];
    },
    {
      name: "swapExactOut";
      discriminator: [71, 66, 127, 123, 231, 29, 227, 92];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "onlyOwner";
      msg: "Attempt to call an owner only function not by the owner";
    },
    {
      code: 6001;
      name: "invalidTokenAccountData";
      msg: "Token account data is not as expected";
    },
    {
      code: 6002;
      name: "invalidAccountData";
      msg: "Account data is not as expected";
    },
    {
      code: 6003;
      name: "decimalsMismatch";
      msg: "Token pair decimals mismatch";
    },
    {
      code: 6004;
      name: "invalidTokenExtension";
      msg: "Token should not have this extension";
    },
    {
      code: 6005;
      name: "incorrectAccounts";
      msg: "Wrong account(s) passed as input";
    },
    {
      code: 6006;
      name: "incorrectAuthority";
      msg: "Wrong authority passed as input";
    },
    {
      code: 6007;
      name: "invalidDelegate";
      msg: "Delegate not allowed";
    },
    {
      code: 6008;
      name: "unsupportedFeature";
      msg: "This feature is currently unsupported or unenabled";
    },
    {
      code: 6009;
      name: "functionPaused";
      msg: "This function is currently paused";
    },
    {
      code: 6010;
      name: "invalidFee";
      msg: "Fee must be less than 100 basis points";
    },
    {
      code: 6011;
      name: "invalidPoolCreate";
      msg: "Token mints must be ordered by pubkey";
    },
    {
      code: 6012;
      name: "invalidCurveParams";
      msg: "Curve params must be positive";
    },
    {
      code: 6013;
      name: "insufficientLiquidity";
      msg: "Pool has too little liquidity for action";
    },
    {
      code: 6014;
      name: "liquidityAddUnbalanced";
      msg: "Liquidity add does not make pool balanced (or curve params are asymmetric)";
    },
    {
      code: 6015;
      name: "insufficientBalance";
      msg: "Input is more than trader balance";
    },
    {
      code: 6016;
      name: "inputTooSmall";
      msg: "Input is below the minimum expected";
    },
    {
      code: 6017;
      name: "inputTooBig";
      msg: "Input is more than available liquidity";
    },
    {
      code: 6018;
      name: "outputTooSmall";
      msg: "Output is below the minimum expected";
    },
    {
      code: 6019;
      name: "invariantOverflow";
      msg: "Invariant computation overflowed";
    },
    {
      code: 6020;
      name: "invariantViolated";
      msg: "Invariant does not hold";
    },
    {
      code: 6021;
      name: "liquidityAddTooSmall";
      msg: "Depositing too little liquidity";
    },
    {
      code: 6022;
      name: "unsupportedTokenProgram";
      msg: "Only Token Program 2022 and/or Token Program are supported";
    },
    {
      code: 6023;
      name: "invalidPoolWeights";
      msg: "Some pool weights are zero or nonzero and shouldn't be";
    },
    {
      code: 6024;
      name: "swapOverflowError";
      msg: "A swap math operation overflowed";
    },
    {
      code: 6025;
      name: "liquidityMathOverflow";
      msg: "An add/remove liquidity math operation overflowed";
    },
    {
      code: 6026;
      name: "invalidBalanceDeltas";
      msg: "Some add/remove balance deltas are nonzero and shouldn't be";
    },
    {
      code: 6027;
      name: "invalidPoolParams";
      msg: "The provided pool params were not well formed";
    },
    {
      code: 6028;
      name: "invalidHints";
      msg: "The hints provided do not bound the swap amounts";
    },
    {
      code: 6029;
      name: "feeError";
      msg: "Unexpected fee result";
    },
    {
      code: 6030;
      name: "vaultOverflowError";
      msg: "A vault math operation overflowed";
    },
    {
      code: 6031;
      name: "outputTooBig";
      msg: "Output is above the maximum expected";
    },
    {
      code: 6032;
      name: "unreachable";
      msg: "This cannot happen";
    },
    {
      code: 6033;
      name: "invalidAction";
      msg: "This action is not allowed";
    },
    {
      code: 6034;
      name: "missingAccount";
      msg: "Missing account";
    },
    {
      code: 6035;
      name: "incorrectFeeReceiver";
      msg: "Incorrect fee receiver";
    },
    {
      code: 6036;
      name: "invalidPairIndex";
      msg: "Invalid pair index";
    }
  ];
  types: [
    {
      name: "addLiquidity";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lpTokenMintAmount";
            type: "u64";
          },
          {
            name: "xReserveDeltas";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "yReserveDeltas";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "invLDeltas";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "minLpTokenMintAmount";
            type: "u64";
          },
          {
            name: "trader";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "addLiquidityData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxAmountsIn";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "minLpTokenMintAmount";
            type: "u64";
          },
          {
            name: "takeSwaps";
            type: "u8";
          },
          {
            name: "swapPaths";
            type: {
              array: ["u8", 10];
            };
          },
          {
            name: "swapAmounts";
            type: {
              array: ["u64", 10];
            };
          }
        ];
      };
    },
    {
      name: "createStablePoolData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "feeNum";
            type: "u32";
          },
          {
            name: "feeDenom";
            type: "u32";
          },
          {
            name: "poolSeed";
            type: "pubkey";
          },
          {
            name: "weights";
            type: {
              array: ["u32", 10];
            };
          },
          {
            name: "invT";
            type: "u64";
          },
          {
            name: "invTMax";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "initVirtualStablePairData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "initAmount";
            type: "u64";
          },
          {
            name: "curveAmp";
            type: "u128";
          },
          {
            name: "curveA";
            type: "u128";
          },
          {
            name: "curveB";
            type: "u128";
          },
          {
            name: "curveAlpha";
            type: "u64";
          },
          {
            name: "curveBeta";
            type: "u64";
          },
          {
            name: "pairSeed";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "numeraireConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "status";
            type: "u32";
          },
          {
            name: "rateMints";
            type: {
              array: ["pubkey", 10];
            };
          },
          {
            name: "rateNums";
            type: {
              array: ["u32", 10];
            };
          },
          {
            name: "rateDenoms";
            type: {
              array: ["u32", 10];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u8", 12];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u8", 1024];
            };
          }
        ];
      };
    },
    {
      name: "quote";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "removeLiquidity";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lpTokenRedeemAmount";
            type: "u64";
          },
          {
            name: "xReserveDeltas";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "yReserveDeltas";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "invLDeltas";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "minAmountsOut";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "trader";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "removeLiquidityData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "lpTokenRedeemAmount";
            type: "u64";
          },
          {
            name: "minAmountsOut";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "outIndex";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "setBondingCurveData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pairIndex";
            type: "u8";
          },
          {
            name: "trueAlpha";
            type: "u64";
          },
          {
            name: "curveAmp";
            type: {
              option: "u128";
            };
          },
          {
            name: "curveA";
            type: {
              option: "u128";
            };
          },
          {
            name: "curveB";
            type: {
              option: "u128";
            };
          },
          {
            name: "curveAlpha";
            type: {
              option: "u64";
            };
          },
          {
            name: "curveBeta";
            type: {
              option: "u64";
            };
          }
        ];
      };
    },
    {
      name: "setFeeData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeNum";
            type: "u32";
          },
          {
            name: "feeDenom";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "setFeeReceiverAuthorityData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "setInvTMaxData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "invTMax";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "setMetadataData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "symbol";
            type: "string";
          },
          {
            name: "uri";
            type: "string";
          }
        ];
      };
    },
    {
      name: "setOwnerData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "setProtocolFeeProportionData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "proportion";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "setRateData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "rateMint";
            type: "pubkey";
          },
          {
            name: "rateNum";
            type: "u32";
          },
          {
            name: "rateDenom";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "setStatusData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "status";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "setWeightsData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "weights";
            type: {
              array: ["u32", 10];
            };
          }
        ];
      };
    },
    {
      name: "setWhilelistedAddrData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "whitelistedAddr";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "stablePool";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "poolSeed";
            type: "pubkey";
          },
          {
            name: "lpMint";
            type: "pubkey";
          },
          {
            name: "whitelistedAdder";
            type: "pubkey";
          },
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "invT";
            type: "u64";
          },
          {
            name: "invTMax";
            type: "u64";
          },
          {
            name: "pairs";
            type: {
              array: [
                {
                  defined: {
                    name: "virtualStablePair";
                  };
                },
                10
              ];
            };
          },
          {
            name: "weights";
            type: {
              array: ["u32", 10];
            };
          },
          {
            name: "totalWeight";
            type: "u64";
          },
          {
            name: "status";
            type: "u32";
          },
          {
            name: "feeNum";
            type: "u32";
          },
          {
            name: "feeDenom";
            type: "u32";
          },
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "numStables";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 2];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u8", 128];
            };
          }
        ];
      };
    },
    {
      name: "swapExactIn";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
          {
            name: "amountOut";
            type: "u64";
          },
          {
            name: "minAmountOut";
            type: "u64";
          },
          {
            name: "trader";
            type: "pubkey";
          },
          {
            name: "inIndex";
            type: "u8";
          },
          {
            name: "outIndex";
            type: "u8";
          },
          {
            name: "pool";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "swapExactInData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "inIndex";
            type: "u8";
          },
          {
            name: "outIndex";
            type: "u8";
          },
          {
            name: "exactAmountIn";
            type: "u64";
          },
          {
            name: "minAmountOut";
            type: "u64";
          },
          {
            name: "hints";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "pathHints";
            type: {
              array: ["u8", 10];
            };
          }
        ];
      };
    },
    {
      name: "swapExactInHintlessData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "inIndex";
            type: "u8";
          },
          {
            name: "outIndex";
            type: "u8";
          },
          {
            name: "exactAmountIn";
            type: "u64";
          },
          {
            name: "minAmountOut";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "swapExactOut";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
          {
            name: "amountOut";
            type: "u64";
          },
          {
            name: "maxAmountIn";
            type: "u64";
          },
          {
            name: "trader";
            type: "pubkey";
          },
          {
            name: "inIndex";
            type: "u8";
          },
          {
            name: "outIndex";
            type: "u8";
          },
          {
            name: "pool";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "swapExactOutData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "inIndex";
            type: "u8";
          },
          {
            name: "outIndex";
            type: "u8";
          },
          {
            name: "exactAmountOut";
            type: "u64";
          },
          {
            name: "maxAmountIn";
            type: "u64";
          },
          {
            name: "hints";
            type: {
              array: ["u64", 10];
            };
          },
          {
            name: "pathHints";
            type: {
              array: ["u8", 10];
            };
          }
        ];
      };
    },
    {
      name: "swapExactOutHintlessData";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "inIndex";
            type: "u8";
          },
          {
            name: "outIndex";
            type: "u8";
          },
          {
            name: "exactAmountOut";
            type: "u64";
          },
          {
            name: "maxAmountIn";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "virtualStablePair";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "pairAuthority";
            type: "pubkey";
          },
          {
            name: "xReserveAmount";
            type: "u64";
          },
          {
            name: "yReserve";
            type: "u64";
          },
          {
            name: "curveAmp";
            docs: [
              "Curve params. Define bonding curve shape: x + y + a + b - A / (x + a) - A / (y + b) - D = 0"
            ];
            type: "u128";
          },
          {
            name: "curveA";
            type: "u128";
          },
          {
            name: "curveB";
            type: "u128";
          },
          {
            name: "invL";
            docs: [
              "Invariant constant. For invariant: x/L + y/L + a + b - A / (x/L + a) - A / (y/L + b) - D = 0"
            ];
            type: "u128";
          },
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "xMint";
            type: "pubkey";
          },
          {
            name: "xVault";
            type: "pubkey";
          },
          {
            name: "curveAlpha";
            type: "u64";
          },
          {
            name: "curveBeta";
            type: "u64";
          },
          {
            name: "newestRateNum";
            type: "u32";
          },
          {
            name: "newestRateDenom";
            type: "u32";
          },
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "pairIndex";
            type: "u8";
          },
          {
            name: "xIs2022";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 5];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u8", 128];
            };
          }
        ];
      };
    }
  ];
  constants: [
    {
      name: "authoritySeed";
      type: "bytes";
      value: "[97, 117, 116, 104, 111, 114, 105, 116, 121]";
    },
    {
      name: "configSeed";
      type: "bytes";
      value: "[99, 111, 110, 102, 105, 103]";
    },
    {
      name: "liquiditySeed";
      type: "bytes";
      value: "[108, 105, 113, 117, 105, 100, 105, 116, 121]";
    },
    {
      name: "lpTokenProgram";
      type: "pubkey";
      value: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
    },
    {
      name: "maxStablesPerPool";
      type: "u8";
      value: "10";
    },
    {
      name: "normalizedValueDecimals";
      type: "u8";
      value: "6";
    }
  ];
};
