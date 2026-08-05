import { describe, it, expect } from "vitest";
import { shareOf, balances, totals, simplifyDebts } from "./calc";
import type { EqualExpense, ExactExpense, GroupState, Payment, Person } from "./model";
import { parseAmountToCents, formatCents } from "./money";
import { validateExpense } from "./validation";

function person(id: string, i: number): Person {
  return { id, name: id, color: "#000", createdAt: i };
}

const A = person("a", 0);
const B = person("b", 1);
const C = person("c", 2);
const PEOPLE = [A, B, C];

function equal(over: string[], amount: number, payer = "a"): EqualExpense {
  return {
    id: "e",
    description: "x",
    amountCents: amount,
    payerId: payer,
    date: "2026-07-19",
    createdAt: 0,
    splitMode: "equal",
    participants: over,
  };
}

function payment(
  from: string,
  to: string,
  amount: number,
  status: Payment["status"]
): Payment {
  return { id: "p", fromId: from, toId: to, amountCents: amount, method: "cash", status, createdAt: 0 };
}

describe("shareOf — equal split", () => {
  it("splits evenly when divisible", () => {
    expect(shareOf(equal(["a", "b", "c"], 900), PEOPLE)).toEqual({ a: 300, b: 300, c: 300 });
  });

  it("distributes the remainder by canonical people order; sum === amount", () => {
    const shares = shareOf(equal(["a", "b", "c"], 1000), PEOPLE); // 1000/3
    expect(shares).toEqual({ a: 334, b: 333, c: 333 });
    expect(shares.a + shares.b + shares.c).toBe(1000);
  });

  it("is independent of participants[] ordering (deterministic rounding)", () => {
    const s1 = shareOf(equal(["a", "b", "c"], 1000), PEOPLE);
    const s2 = shareOf(equal(["c", "a", "b"], 1000), PEOPLE);
    const s3 = shareOf(equal(["b", "c", "a"], 1000), PEOPLE);
    expect(s2).toEqual(s1);
    expect(s3).toEqual(s1);
  });

  it("supports a subset (payer excluded from participants)", () => {
    const shares = shareOf(equal(["b", "c"], 1000, "a"), PEOPLE);
    expect(shares).toEqual({ b: 500, c: 500 });
    expect(shares.a).toBeUndefined();
  });

  it("throws on zero participants instead of dividing by zero", () => {
    expect(() => shareOf(equal([], 1000), PEOPLE)).toThrow();
  });
});

describe("shareOf — exact split", () => {
  it("returns exactShares as-is", () => {
    const e: ExactExpense = {
      id: "e",
      description: "x",
      amountCents: 1000,
      payerId: "a",
      date: "2026-07-19",
      createdAt: 0,
      splitMode: "exact",
      exactShares: { a: 700, b: 300 },
    };
    expect(shareOf(e, PEOPLE)).toEqual({ a: 700, b: 300 });
  });
});

describe("balances", () => {
  it("the user example: pay 120€, split among all — payer +105, others −15", () => {
    const people = Array.from({ length: 8 }, (_, i) => person(String(i), i));
    const state: GroupState = {
      name: "trip",
      people,
      expenses: [
        {
          id: "e",
          description: "dinner",
          amountCents: 12000,
          payerId: "0",
          date: "2026-07-19",
          createdAt: 0,
          splitMode: "equal",
          participants: people.map((p) => p.id),
        },
      ],
      payments: [],
    };
    const net = balances(state);
    expect(net["0"]).toBe(12000 - 1500);
    for (let i = 1; i < 8; i++) expect(net[String(i)]).toBe(-1500);
  });

  it("sum of balances is always 0 (random-ish scenarios)", () => {
    const people = Array.from({ length: 6 }, (_, i) => person(String(i), i));
    const amounts = [1000, 333, 7777, 12, 9999, 501, 88, 4200];
    const expenses = amounts.map((amt, k): EqualExpense => {
      const size = (k % 5) + 1;
      const participants = people.slice(0, size).map((p) => p.id);
      return {
        id: "e" + k,
        description: "x",
        amountCents: amt,
        payerId: String(k % 6),
        date: "2026-07-19",
        createdAt: k,
        splitMode: "equal",
        participants,
      };
    });
    const net = balances({ name: "t", people, expenses, payments: [] });
    const sum = Object.values(net).reduce((a, b) => a + b, 0);
    expect(sum).toBe(0);
  });
});

describe("balances — payments (settle-up)", () => {
  // a pays 900 split among a,b,c → a +600, b −300, c −300
  const base: GroupState = {
    name: "t",
    people: PEOPLE,
    expenses: [equal(["a", "b", "c"], 900, "a")],
    payments: [],
  };

  it("a pending payment has no effect (debt stays counted)", () => {
    const net = balances({ ...base, payments: [payment("b", "a", 300, "pending")] });
    expect(net).toEqual({ a: 600, b: -300, c: -300 });
  });

  it("a confirmed payment offsets the debt as a transfer", () => {
    const net = balances({ ...base, payments: [payment("b", "a", 300, "confirmed")] });
    expect(net).toEqual({ a: 300, b: 0, c: -300 });
  });

  it("sum of balances stays 0 with confirmed payments", () => {
    const net = balances({ ...base, payments: [payment("b", "a", 300, "confirmed"), payment("c", "a", 120, "confirmed")] });
    expect(Object.values(net).reduce((x, y) => x + y, 0)).toBe(0);
  });

  it("confirming a frozen snapshot larger than the current debt pushes the debtor into credit", () => {
    // b's debt shrank to 100 (b paid a 600 expense split over a,b,c after claiming),
    // but the frozen 300 claim is confirmed: b really handed 300 over.
    const state: GroupState = {
      ...base,
      expenses: [...base.expenses, equal(["a", "b", "c"], 600, "b")],
      payments: [payment("b", "a", 300, "confirmed")],
    };
    const net = balances(state);
    expect(net.b).toBe(-300 - 200 + 600 + 300); // shares −300−200, paid 600, transfer +300
    expect(net.b).toBeGreaterThan(0);
    expect(Object.values(net).reduce((x, y) => x + y, 0)).toBe(0);
  });

  it("totals (trip total) ignore payments — a settle-up is not an expense", () => {
    const withPay = { ...base, payments: [payment("b", "a", 300, "confirmed")] };
    expect(totals(withPay)).toEqual(totals(base));
  });
});

describe("totals", () => {
  it("sums paid per payer and the grand total", () => {
    const state: GroupState = {
      name: "t",
      people: PEOPLE,
      expenses: [equal(["a", "b", "c"], 900, "a"), equal(["a", "b"], 200, "b")],
      payments: [],
    };
    const { perPerson, grand } = totals(state);
    expect(perPerson.a).toBe(900);
    expect(perPerson.b).toBe(200);
    expect(perPerson.c).toBe(0);
    expect(grand).toBe(1100);
  });
});

describe("simplifyDebts", () => {
  it("zeroes out every balance and produces no negative payments", () => {
    const net = { a: 1500, b: -1000, c: -500 };
    const settlements = simplifyDebts(net);
    for (const s of settlements) expect(s.amountCents).toBeGreaterThan(0);

    const applied: Record<string, number> = { ...net };
    for (const s of settlements) {
      applied[s.fromId] += s.amountCents;
      applied[s.toId] -= s.amountCents;
    }
    for (const v of Object.values(applied)) expect(v).toBe(0);
  });

  it("no settlements when everything is settled", () => {
    expect(simplifyDebts({ a: 0, b: 0 })).toEqual([]);
  });
});

describe("parseAmountToCents", () => {
  it("accepts comma and dot", () => {
    expect(parseAmountToCents("12,50")).toEqual({ cents: 1250 });
    expect(parseAmountToCents("12.50")).toEqual({ cents: 1250 });
    expect(parseAmountToCents(" 7 ")).toEqual({ cents: 700 });
  });
  it("rejects empty, non-numeric, negative, zero and >2 decimals", () => {
    expect(parseAmountToCents("")).toEqual({ error: "empty" });
    expect(parseAmountToCents("abc")).toEqual({ error: "invalid" });
    expect(parseAmountToCents("-5")).toEqual({ error: "invalid" });
    expect(parseAmountToCents("0")).toEqual({ error: "nonpositive" });
    expect(parseAmountToCents("1,234")).toEqual({ error: "invalid" });
  });
  it("round-trips through formatCents", () => {
    expect(formatCents(1250)).toBe("12,50");
  });
});

describe("validateExpense", () => {
  const ids = new Set(["a", "b", "c"]);

  it("accepts a valid equal draft", () => {
    expect(
      validateExpense(
        { splitMode: "equal", description: "d", amountCents: 900, payerId: "a", date: "2026-07-19", participants: ["a", "b", "c"] },
        ids
      )
    ).toBeNull();
  });

  it("rejects equal with no participants", () => {
    expect(
      validateExpense(
        { splitMode: "equal", description: "d", amountCents: 900, payerId: "a", date: "2026-07-19", participants: [] },
        ids
      )
    ).toBe("no-participants");
  });

  it("rejects exact shares that do not sum to the total", () => {
    expect(
      validateExpense(
        { splitMode: "exact", description: "d", amountCents: 1000, payerId: "a", date: "2026-07-19", exactShares: { a: 600, b: 300 } },
        ids
      )
    ).toBe("shares-mismatch");
  });

  it("rejects bad amount and unknown payer", () => {
    expect(
      validateExpense(
        { splitMode: "equal", description: "d", amountCents: 0, payerId: "a", date: "2026-07-19", participants: ["a"] },
        ids
      )
    ).toBe("bad-amount");
    expect(
      validateExpense(
        { splitMode: "equal", description: "d", amountCents: 100, payerId: "z", date: "2026-07-19", participants: ["a"] },
        ids
      )
    ).toBe("bad-payer");
  });
});
