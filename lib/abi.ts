export const creditRegistryAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "evidenceHash", type: "bytes32" },
      { name: "uri", type: "string" },
    ],
    outputs: [{ name: "creditId", type: "uint256" }],
  },
  {
    type: "function",
    name: "retire",
    stateMutability: "nonpayable",
    inputs: [{ name: "creditId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "contest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "creditId", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCredit",
    stateMutability: "view",
    inputs: [{ name: "creditId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "evidenceHash", type: "bytes32" },
          { name: "uri", type: "string" },
          { name: "issuer", type: "address" },
          { name: "status", type: "uint8" },
          { name: "issuedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "creditIdForEvidence",
    stateMutability: "view",
    inputs: [{ name: "evidenceHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "nextId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "evidenceHashToCreditId",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "error",
    name: "EVIDENCE_ALREADY_USED",
    inputs: [
      { name: "evidenceHash", type: "bytes32" },
      { name: "creditId", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "EMPTY_EVIDENCE",
    inputs: [],
  },
  {
    type: "error",
    name: "EMPTY_URI",
    inputs: [],
  },
  {
    type: "error",
    name: "CREDIT_NOT_FOUND",
    inputs: [{ name: "creditId", type: "uint256" }],
  },
  {
    type: "error",
    name: "NOT_ISSUER",
    inputs: [
      { name: "creditId", type: "uint256" },
      { name: "caller", type: "address" },
    ],
  },
  {
    type: "error",
    name: "CREDIT_NOT_ISSUED",
    inputs: [
      { name: "creditId", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
  },
  {
    type: "event",
    name: "CreditMinted",
    inputs: [
      { name: "creditId", type: "uint256", indexed: true },
      { name: "evidenceHash", type: "bytes32", indexed: true },
      { name: "issuer", type: "address", indexed: true },
      { name: "uri", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CreditRetired",
    inputs: [
      { name: "creditId", type: "uint256", indexed: true },
      { name: "by", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "CreditContested",
    inputs: [
      { name: "creditId", type: "uint256", indexed: true },
      { name: "by", type: "address", indexed: true },
      { name: "reason", type: "string", indexed: false },
    ],
  },
] as const;

export const STATUS_LABEL = ["None", "Issued", "Retired", "Contested"] as const;
