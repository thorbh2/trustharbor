/** Static deployment facts (public hashes only) shown on the admin/status page. */
export const DEPLOYMENT = {
  network: "GenLayer Studionet",
  chainId: 61999,
  deployer: "0xdCcB30dE49871824Eb81556Cf2a7eb9cE7A5805c",
  contractAddress: "0x9E0Ab8752aEe5DFE4F361f576c99180785392fC9",
  deployTxHash: "0x2b2bce279fe592552e0e0858e8aa8b2dd42fa07f750688df9aa37d3af436e8ac",
  faucetTxHash: "0xfc4f82a362518761a12de2713e839df6949df1a4f7225f287b3e4c2c8fb47696",
  smoke: [
    { label: "create_deal", hash: "0xc794858f6aaa23733007fec83754e05fd6971e83e99c708da99f91719d3ab9fc" },
    { label: "add_milestone", hash: "0x6561b046ad138f5cbc05cfbc8955515ee977fb367545e59fd1433b874f30ae3a" },
    { label: "activate_deal", hash: "0x6b495a5f47e7556f1d2542a6ca343185f74e0b4a0409ae1f6ded968e3a86ecd8" },
    { label: "submit_milestone_proof", hash: "0x780cb80d423cfe70d51e0eed2bf36fc907e8d72a88e810d27d2328b6c14c1fdf" },
    { label: "review_milestone (release/96)", hash: "0xc1131e581affc3ea73bd265f401fbaf05fabfede53c9d9cdcd1f06e140857f01" },
    { label: "open_dispute", hash: "0x1e5dca28b80516478b494e411e31e559c947c233ad974dfb6d5cb0b82fac9452" },
    { label: "file_appeal", hash: "0xb40069a943686e34f415033d5e42b336bb3685f08eedf780a8b6b29eb898aa71" },
    { label: "resolve_dispute (provider_upheld)", hash: "0xb69ced68c1a56b66ad77b69b9e86c57a91f3ece2239afa0670cdf0dce9789406" },
    { label: "resolve_appeal (denied)", hash: "0xcfcb287e07f5711cb7aa7d4752074ba96df79c6a4f72a522c739c6efdffae7e8" },
    { label: "release_milestone (deal completed)", hash: "0x06cf2f0a9bb5fbdb4d3bce9b81b8ca452122f52585b5a01c718d2a36231fe664" },
    { label: "cancel_deal", hash: "0xf20021e6f763da51210f44b9e70246195a4d88d5022570876caa40a8e0366d3a" },
    { label: "archive_deal", hash: "0xd7ca3800fe888ad907bb04f0d007bd9e09b3a9972bd197a426332fca25038841" },
  ],
} as const;
