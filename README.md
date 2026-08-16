# Verdict — Myntra wishlist decision layer (concept)

**This is a concept prototype. It is not the Myntra app.**

Growth case for: increase the share of users who purchase at least one wishlisted item within 30 days of adding it. No monetary incentives.

## Public URLs

After GitHub Pages is live:

| Artefact | URL |
|---|---|
| MVP | https://aryarajsingh.github.io/myntra-verdict/ |
| Discovery engine | https://aryarajsingh.github.io/myntra-verdict/discovery/ |
| Research | https://aryarajsingh.github.io/myntra-verdict/research/ |
| Deck (web) | https://aryarajsingh.github.io/myntra-verdict/deck/ |
| Deck (PDF) | https://aryarajsingh.github.io/myntra-verdict/Verdict-Wishlist-Deck.pdf |

## How to test

1. Open `/`. Complete sizes (or skip). Default analog: tops M, bottoms M, ethnic L, height 5'2"–5'5", regular.
2. Wishlist is grouped **Ready / Check fit / Still exploring** (words + shape, not colour alone).
3. Open a Check fit item (ONLY cropped blazer or Libas Anarkali). Read fit analog, return policy, compare, Ask a doubt.
4. Seal-tag saree stays in Still exploring — no bag push.
5. Open `/discovery`. Rank table, click a barrier for quotes, Compare fit vs EORS wait, paste a review into Classify.
6. Open `/deck` → Print → Save as PDF, landscape. All type is 14pt. No fellow name.

## WhyWait (1-slide)

Public quotes → extract job / barrier / intent / workaround / proximity → score F×S×M×N → rank → disqualify monetary → pick fit + return-risk.

Not sentiment. A 5-star “sized up” is still fit uncertainty blocking a saved SKU.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000
