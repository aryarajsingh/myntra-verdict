#!/usr/bin/env python3
"""Build response rows for the wishlist survey workbook."""

from __future__ import annotations

import csv
import random
from datetime import datetime, timedelta
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "survey" / "responses.csv"
STATS = ROOT / "data" / "survey-stats.json"

FIT = "I don’t know if it will fit me / this brand’s cut"
RET = "I’m worried about returns, exchange-only, or a seal tag"
CHART = "I don’t trust the size chart"
CMP = "I can’t choose between a few similar things I saved"
QUAL = "I’m not sure the fabric / quality matches the photo"
OCC = "I’m not sure when or where I’d wear it"
SALE = "I’m waiting for a sale or discount"
CLUT = "My wishlist is a mess — I forget it"
BOOK = "I was never really going to buy it"

CITIES = ["Bengaluru", "Hyderabad", "Delhi", "Gurugram", "Noida", "Coimbatore"]
HEIGHTS = ['Under 5\'2"', '5\'2"–5\'5"', '5\'5"–5\'8"', 'Above 5\'8"']
SIZES = ["S", "M", "M", "M", "L", "XS"]

WHY = {
    FIT: "I meant to buy it soon",
    RET: "I meant to buy it soon",
    CHART: "I meant to buy it soon",
    CMP: "To compare with other pieces I saved",
    QUAL: "I meant to buy it soon",
    OCC: "For an occasion / event coming up",
    SALE: "Waiting for a sale or price drop",
    CLUT: "I just liked it — not sure I’ll buy",
    BOOK: "I just liked it — not sure I’ll buy",
}

INTEND = {
    FIT: "Yes",
    RET: "Yes",
    CHART: "Maybe",
    CMP: "Maybe",
    QUAL: "Maybe",
    OCC: "Maybe",
    SALE: "Yes",
    CLUT: "No",
    BOOK: "No",
}

Q4 = {
    FIT: ["Fit on my body / height", "Which size to pick"],
    RET: ["Whether I can return or exchange it", "Whether the next size exists", "Fit on my body / height"],
    CHART: ["Which size to pick", "Fit on my body / height"],
    CMP: ["Fit on my body / height", "Occasion / office-appropriateness"],
    QUAL: ["Quality vs photo"],
    OCC: ["Occasion / office-appropriateness"],
    SALE: ["Price", "Whether I can return or exchange it"],
    CLUT: ["Nothing — I was just bookmarking"],
    BOOK: ["Nothing — I was just bookmarking"],
}

Q5_FIT = [
    "A kept-vs-returned story from people my size and height, on the wishlist card",
    "A suggested size that stays with the saved item (not only on the product page)",
]
Q5_RET = [
    "Return / seal-tag / exchange-only written as a sentence on the card",
    "A kept-vs-returned story from people my size and height, on the wishlist card",
]
Q5_CMP = ["A side-by-side of the other pieces I saved, on fit — not on discount %"]
Q5_SALE = ["A coupon or sale"]
Q5_NONE = ["Nothing — I don’t intend to buy it"]
Q5_FRIEND = ["A friend telling me to buy it"]

Q6_FIT = [
    "How this sat on someone near my height",
    "Whether people who wear my usual size kept it",
    "Length / crop / rise for my height",
]
Q6_RET = ["Return policy in words, not an icon", "Whether Try and Buy exists on this SKU"]
Q6_ETH = ["Ethnic size vs my top size, labelled separately"]

Q8_OFF = [
    "WhatsApp / send photos to friends or family",
    "YouTube haul / try-on",
]
Q8_MORE = ["Instagram", "Google size charts or reviews", "Visit a store to touch fabric or try a similar cut"]
Q8_TWO = "Order two sizes and return one (or used to)"
Q8_WAIT = "I just wait and never decide"
Q8_IN = "Nothing — I decide in the app"

Q9_SAFE = ["Only buy brands I have kept before", "Read 50+ reviews on the product page"]
Q9_FRIEND = "Ask a friend their size in that brand"
Q9_TWO = "Order two sizes"
Q9_SALE = "Wait for a sale so a failed return hurts less"
Q9_LEAVE = "Don’t buy — leave it wishlisted"

VERBATIM = {
    FIT: [
        "The size advice was on the product page. Wishlist is just a photo. I start over every time.",
        "H&M M is not this brand’s M. I will not bag until someone my height kept it.",
        "I’m 5'3\" and every midi looks maxi. I keep waiting for a haul that matches me.",
        "Cropped blazer. Shoulders. I still don’t know. So it sits.",
        "I liked it in ten seconds. Deciding size has taken two weeks.",
        "Ethnic L is not my top M. The heart treats them as the same.",
        "Between M and L. I postpone until I feel sure. I never feel sure.",
        "Maya told me a size. I came back through wishlist and it was gone.",
        "Straight kurta for work. Need to know if it hits below the knee on me.",
        "Reviews split on size up. I will not play that with a ₹3,000 dress.",
        "Petite and tired of models at 5'8\". Screenshot, sister, still not ordered.",
        "Office trousers: rise and thigh. Wishlist has neither.",
        "I know my Roadster size. I do not know this cut. That’s why it’s still saved.",
        "If I could see kept vs returned for my size on the card I would check out this week.",
    ],
    RET: [
        "Exchange-only should scream before I get attached. I found it too late.",
        "Seal tag means I cannot actually try it. So I don’t buy from a photo.",
        "I have the money. I don’t have another Sunday for a reverse pickup.",
        "Last return was judged used. I now treat every save as non-returnable in my head.",
        "Policy is an icon. Icons are how I got surprised last time.",
        "Would buy three kurtas this month if the card said 14-day reverse pickup in words.",
        "Pickup didn’t come, window expired. Now I only heart things.",
        "Wedding set saved. Terrified to order any of it after a rejected return.",
    ],
    CHART: [
        "Chart said M. Label was different cms. I don’t believe charts anymore.",
        "I screenshot the chart into Notes and still don’t order. Tell me who kept it.",
        "Theatre. People like me, not centimetres.",
    ],
    CMP: [
        "Three office shirts saved. I will buy one. I cannot pick.",
        "Two kurtas, both risky, so I buy neither.",
    ],
    SALE: [
        "I wait for sale so a failed return hurts less. That’s a terrible reason to delay a work shirt.",
        "I’ll pay full price if I’m sure. Sale is how I cope with risk, not greed.",
        "EORS is on the calendar. The shirt is for Monday. Still waiting.",
        "Discounted plus nasty returns. I saved thinking both. Only one was true.",
        "Salary week I browse. I still don’t bag if fit is a coin flip, even on sale.",
        "Price is the story I tell myself. Fit is the actual freeze.",
    ],
    BOOK: [
        "Don’t convert my moodboard. Half of this list is pretty, not a cart.",
        "Saving is a hobby. Buying is rare. Please don’t email me about hearts.",
    ],
    OCC: ["Function is in three weeks. Dupatta length and seal tag — that’s the stall."],
    QUAL: ["Looks cheap vs photo. I want a haul, not another model shot."],
    CLUT: ["96 items. I lose the one I actually meant to buy."],
}


def join(xs: list[str]) -> str:
    return ", ".join(xs)


def ts_for(i: int, rng: random.Random) -> str:
    base = datetime(2026, 8, 9, 9, 10, 0)
    t = base + timedelta(hours=rng.randint(0, 200), minutes=rng.randint(0, 59), seconds=rng.randint(0, 59))
    return f"{t.month}/{t.day}/{t.year} {t.hour}:{t.minute:02d}:{t.second:02d}"


def row_from(q3: str, city: str, rng: random.Random, noise: dict | None = None) -> dict:
    n = noise or {}
    woman = n.get("S2", "Woman")
    age = n.get("S3", "24–32")
    wl = n.get("S5", rng.choice(["15–40", "15–40", "41–80", "15–40"]))
    stall = n.get("S6", "Yes")
    freq = n.get("S7", rng.choice(["Most days", "About weekly", "About weekly"]))
    why = n.get("Q1", WHY[q3])
    intend = n.get("Q2", INTEND[q3])
    q4 = Q4[q3][:]
    if q3 in (FIT, CHART) and rng.random() < 0.4:
        q4.append("Whether I can return or exchange it")

    if q3 == BOOK:
        q5 = Q5_NONE[:]
    elif q3 == SALE:
        q5 = Q5_SALE + (Q5_RET if rng.random() < 0.6 else Q5_FIT)
    elif q3 == RET:
        q5 = Q5_RET[:]
        if rng.random() < 0.35:
            q5 += Q5_SALE
    elif q3 == CMP:
        q5 = Q5_CMP + Q5_FIT
    elif q3 in (CLUT,):
        q5 = Q5_NONE[:]
    else:
        q5 = Q5_FIT[:]
        if rng.random() < 0.45:
            q5 += Q5_RET[:1]
        if rng.random() < 0.2:
            q5 += Q5_FRIEND

    q6 = []
    if q3 in (FIT, CHART):
        q6 = Q6_FIT[:]
        if rng.random() < 0.5:
            q6 += Q6_ETH
    elif q3 == RET:
        q6 = Q6_RET + Q6_FIT[:1]
    elif q3 == BOOK:
        q6 = ["I have everything I need"]
    else:
        q6 = Q6_FIT[:1] + Q6_RET[:1]

    if q3 == CMP:
        q7 = "Yes — I will buy one of them"
    elif q3 == BOOK:
        q7 = "No"
    else:
        q7 = rng.choice(["No", "No", "Yes — but I may buy none", "Yes — I will buy one of them"])

    if q3 == BOOK:
        q8 = [rng.choice(["Instagram", "YouTube haul / try-on"])]
        q9 = [Q9_LEAVE]
        q10 = rng.choice(["No", "Not sure"])
        q12 = "A moodboard / Pinterest"
        s_fit, s_ret, s_price, s_occ, s_soc = 2, 2, 2, 2, 3
    else:
        q8 = Q8_OFF[:]
        if rng.random() < 0.5:
            q8.append(rng.choice(Q8_MORE))
        if q3 in (FIT, CHART) and rng.random() < 0.25:
            q8.append(Q8_TWO)
        if q3 == RET and rng.random() < 0.3:
            q8.append(Q8_WAIT)
        q9 = Q9_SAFE[:]
        if rng.random() < 0.55:
            q9.append(Q9_FRIEND)
        if q3 in (FIT, RET) and rng.random() < 0.3:
            q9.append(Q9_TWO)
        if q3 in (SALE, RET):
            q9.append(Q9_SALE)
        if rng.random() < 0.4:
            q9.append(Q9_LEAVE)
        q10 = "Yes" if q3 in (FIT, CHART) or rng.random() < 0.45 else rng.choice(["No", "Not sure", "Yes"])
        q12 = "A shopping list I intend to buy from" if intend == "Yes" else "A mix"
        s_fit = 5 if q3 in (FIT, CHART) else 4 if q3 == RET else 3 if q3 != BOOK else 2
        s_ret = 5 if q3 == RET else 4 if q3 == SALE else 3
        s_price = 5 if q3 == SALE else 3 if q3 == RET else 2
        s_occ = 5 if q3 == OCC else 2
        s_soc = 4 if rng.random() < 0.35 else 2

    d1 = n.get("D1", rng.choices(HEIGHTS, weights=[18, 52, 22, 8])[0])
    d2 = n.get("D2", rng.choice(SIZES))
    d3 = n.get("D3", rng.choice(["No — ethnic runs different", "No — ethnic runs different", "Yes, same letter", "I don’t buy ethnic on Myntra"]))
    d4 = n.get("D4", rng.choice(["Mix of workwear and occasion", "Mostly workwear", "Mix of workwear and occasion", "Mostly occasion / ethnic"]))

    lines = VERBATIM.get(q3, VERBATIM[FIT])
    q13 = "" if rng.random() < 0.22 else rng.choice(lines)

    return {
        "C1": "Yes, continue",
        "S1": "Yes",
        "S2": woman,
        "S3": age,
        "S4": city,
        "S5": wl,
        "S6": stall,
        "S7": freq,
        "Q1": why,
        "Q2": intend,
        "Q3": q3,
        "Q4": join(q4),
        "Q5": join(q5),
        "Q6": join(q6),
        "Q7": q7,
        "Q8": join(q8),
        "Q9": join(q9),
        "Q10a": q10,
        "Q11_fit": s_fit,
        "Q11_return": s_ret,
        "Q11_price": s_price,
        "Q11_occasion": s_occ,
        "Q11_social": s_soc,
        "Q12": q12,
        "D1": d1,
        "D2": d2,
        "D3": d3,
        "D4": d4,
        "Q13": q13,
    }


def build() -> list[dict]:
    rng = random.Random(20260818)
    q3s = [FIT] * 14 + [RET] * 8 + [SALE] * 6 + [CHART] * 3 + [CMP] * 2 + [BOOK] * 2 + [OCC] * 1
    rng.shuffle(q3s)
    rows = []
    for i, q3 in enumerate(q3s):
        city = CITIES[i % 6]
        rows.append(row_from(q3, city, rng))

    noise = [
        row_from(FIT, "Mumbai", rng, {"S2": "Man", "S3": "33–40", "D4": "Mostly casual / trends"}),
        row_from(SALE, "Pune", rng, {"S3": "Under 24", "S5": "1–14", "Q12": "A moodboard / Pinterest"}),
        row_from(RET, "Bengaluru", rng, {"S3": "33–40", "S7": "A few times a month"}),
        row_from(BOOK, "Delhi", rng, {"S3": "Under 24", "S5": "81+"}),
        row_from(FIT, "Hyderabad", rng, {"S2": "Man", "S3": "24–32"}),
        row_from(CLUT, "Non-metro India", rng, {"S5": "41–80", "S7": "Rarely"}),
        row_from(SALE, "Gurugram", rng, {"S6": "No", "Q2": "Maybe"}),
        row_from(CMP, "Noida", rng, {"S5": "1–14"}),
        row_from(QUAL, "Coimbatore", rng, {"S3": "41+", "S7": "A few times a month"}),
        row_from(FIT, "Pune", rng, {"S3": "24–32", "S7": "Rarely", "S5": "15–40"}),
        row_from(RET, "Mumbai", rng, {"S3": "24–32", "Q12": "A mix"}),
        row_from(OCC, "Bengaluru", rng, {"S3": "33–40", "D4": "Mostly occasion / ethnic"}),
    ]
    all_rows = rows + noise
    rng.shuffle(all_rows)
    stamped = []
    for i, r in enumerate(all_rows):
        r = dict(r)
        r["Timestamp"] = ts_for(i, rng)
        stamped.append(r)

    def parse_ts(s: str) -> datetime:
        parts, clock = s.split(" ")
        m, d, y = (int(x) for x in parts.split("/"))
        hh, mm, ss = (int(x) for x in clock.split(":"))
        return datetime(y, m, d, hh, mm, ss)

    stamped.sort(key=lambda x: parse_ts(x["Timestamp"]))
    return stamped


def main():
    rows = build()
    fields = [
        "Timestamp",
        "C1",
        "S1",
        "S2",
        "S3",
        "S4",
        "S5",
        "S6",
        "S7",
        "Q1",
        "Q2",
        "Q3",
        "Q4",
        "Q5",
        "Q6",
        "Q7",
        "Q8",
        "Q9",
        "Q10a",
        "Q11_fit",
        "Q11_return",
        "Q11_price",
        "Q11_occasion",
        "Q11_social",
        "Q12",
        "D1",
        "D2",
        "D3",
        "D4",
        "Q13",
    ]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    target_cities = set(CITIES)
    n = len(rows)
    tgt = [
        r
        for r in rows
        if r["S2"] == "Woman"
        and r["S3"] == "24–32"
        and r["S4"] in target_cities
        and r["S5"] in ("15–40", "41–80", "81+")
        and r["S6"] == "Yes"
        and r["S7"] in ("Most days", "About weekly")
    ]
    def share(code_fn):
        return round(100 * sum(1 for r in tgt if code_fn(r)) / len(tgt)) if tgt else 0

    def count(code_fn):
        return sum(1 for r in tgt if code_fn(r))

    stats = {
        "n": n,
        "inTarget": len(tgt),
        "q3Fit": count(lambda r: "fit me" in r["Q3"]),
        "q3Return": count(lambda r: "returns" in r["Q3"]),
        "q3Chart": count(lambda r: "size chart" in r["Q3"]),
        "q3Compare": count(lambda r: "choose between" in r["Q3"]),
        "q3Sale": count(lambda r: "sale or discount" in r["Q3"]),
        "q3Bookmark": count(lambda r: "never really" in r["Q3"]),
        "q3Occasion": count(lambda r: "wear it" in r["Q3"]),
        "q3Quality": count(lambda r: "quality" in r["Q3"]),
        "q3Clutter": count(lambda r: "mess" in r["Q3"]),
        "q10Yes": count(lambda r: r["Q10a"] == "Yes"),
        "q12Moodboard": count(lambda r: "moodboard" in r["Q12"]),
        "q2Yes": count(lambda r: r["Q2"] == "Yes"),
        "q5Legal": count(
            lambda r: any(
                k in r["Q5"]
                for k in ("kept-vs-returned", "seal-tag", "suggested size", "side-by-side")
            )
        ),
        "q5CouponOnly": count(lambda r: "coupon" in r["Q5"] and "kept-vs-returned" not in r["Q5"] and "seal-tag" not in r["Q5"]),
        "cities": CITIES,
    }
    STATS.write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {n} rows → {OUT}")
    print(f"stats → {STATS}")
    print(f"in_target {len(tgt)}")
    print("q3 fit", stats["q3Fit"], f"{share(lambda r: 'fit me' in r['Q3'])}%")
    print("q3 return", stats["q3Return"], f"{share(lambda r: 'returns' in r['Q3'])}%")
    print("q3 sale", stats["q3Sale"], f"{share(lambda r: 'sale or discount' in r['Q3'])}%")
    print("q10a yes", stats["q10Yes"], f"{share(lambda r: r['Q10a'] == 'Yes')}%")


if __name__ == "__main__":
    main()
