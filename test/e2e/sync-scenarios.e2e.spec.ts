import * as request from "supertest";
import { createTestApp, TestApp } from "./utils/application";
import { randomUUID } from "crypto";
import { JOHN } from "../mocks";

// Push and pull the way the phone does: whole rows, a cleared field left out,
// many rows saved with the same dates, an init walked page by page.
describe("Sync scenarios (e2e)", () => {
  let testApp: TestApp;

  const auth = ["Authorization", "Bearer " + JOHN.firebaseId] as const;
  const put = (path: string, body: object[]) =>
    request(testApp.app.getHttpServer())
      .put(`/users/${JOHN.id}/${path}`)
      .set(...auth)
      .send(body);
  const init = (page: number, pageSize: number) =>
    request(testApp.app.getHttpServer())
      .get(`/users/${JOHN.id}/init?page=${page}&pageSize=${pageSize}`)
      .set(...auth);

  const now = new Date().toISOString();
  const walletId = randomUUID();
  const labelId = randomUUID();

  beforeAll(async () => {
    testApp = await createTestApp();
    expect(
      (
        await put("wallets", [
          {
            id: walletId,
            name: "Wallet",
            balance: "1000.00",
            type: "CASH",
            createdAt: now,
            updatedAt: now,
          },
        ])
      ).status
    ).toBe(200);
    expect(
      (
        await put("labels", [
          {
            id: labelId,
            name: "Food",
            icon: "restaurant",
            color: "#ff0000",
            createdAt: now,
            updatedAt: now,
          },
        ])
      ).status
    ).toBe(200);
  });

  it("should clear a transaction's label and person when the row comes back without them", async () => {
    const id = randomUUID();
    const row = {
      id,
      walletId,
      amount: "-10.00",
      description: "Lunch",
      type: "EXPENSE",
      createdAt: now,
      updatedAt: now,
    };
    let res = await put("transactions", [
      { ...row, labelId, counterparty: "Paul" },
    ]);
    expect(res.status).toBe(200);
    expect(res.body[0].labelId).toBe(labelId);

    res = await put("transactions", [row]);
    expect(res.status).toBe(200);

    const pulled = (await init(1, 100)).body.transactions.find(
      (t: any) => t.id === id
    );
    expect(pulled.labelId).toBeFalsy();
    expect(pulled.counterparty).toBeNull();
  });

  it("should clear a recurring transaction's end, day and person when edited away", async () => {
    const id = randomUUID();
    const rule = {
      id,
      walletId,
      type: "EXPENSE",
      amount: "100.00",
      description: "Rent {{CURRENT_MONTH}}",
      frequency: "MONTHLY",
      weekDays: [],
      months: [],
      notificationTimes: ["08:00"],
      startAt: now,
      nextOccurrenceAt: now,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    let res = await put("recurring-transactions", [
      {
        ...rule,
        labelId,
        dayOfMonth: 5,
        counterparty: "Landlord",
        endAt: new Date(Date.now() + 86400000 * 90).toISOString(),
      },
    ]);
    expect(res.status).toBe(200);

    // Edited on the phone: never ends, no precise day, no person, no label.
    res = await put("recurring-transactions", [
      { ...rule, frequency: "DAILY", weekDays: ["MONDAY"] },
    ]);
    expect(res.status).toBe(200);

    const pulled = (await init(1, 100)).body.recurringTransactions.find(
      (r: any) => r.id === id
    );
    expect(pulled.frequency).toBe("DAILY");
    expect(pulled.weekDays).toEqual(["MONDAY"]);
    expect(pulled.endAt).toBeNull();
    expect(pulled.dayOfMonth).toBeNull();
    expect(pulled.counterparty).toBeNull();
    expect(pulled.labelId).toBeFalsy();
  });

  it("should return every row exactly once across init pages, even with identical dates", async () => {
    // Both legs of a transfer, a cascade...: rows sharing their dates.
    const sameDate = "2026-01-01T10:00:00.000Z";
    const rows = Array.from({ length: 137 }, () => ({
      id: randomUUID(),
      walletId,
      amount: "-1.00",
      description: "Same second",
      type: "EXPENSE",
      createdAt: sameDate,
      updatedAt: sameDate,
    }));
    for (let i = 0; i < rows.length; i += 50) {
      expect((await put("transactions", rows.slice(i, i + 50))).status).toBe(
        200
      );
    }

    const seen: string[] = [];
    let walletsSeen = 0;
    for (let page = 1; page < 100; page++) {
      const res = await init(page, 7);
      expect(res.status).toBe(200);
      const body = res.body;
      walletsSeen += body.wallets.length;
      seen.push(...body.transactions.map((t: any) => t.id));
      const total = Object.values(body).reduce(
        (sum: number, list: any) => sum + list.length,
        0
      );
      if (total === 0) break;
      // A page is always full until the very end.
      expect(total === 7 || page > 1).toBe(true);
    }

    expect(walletsSeen).toBe(1);
    expect(new Set(seen).size).toBe(seen.length);
    for (const row of rows) {
      expect(seen).toContain(row.id);
    }
  });

  it("should accept rules and occurrences exactly as the phone sends them", async () => {
    const ruleId = randomUUID();
    const transactionId = randomUUID();
    const at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    expect(
      (
        await put("recurring-transactions", [
          {
            id: ruleId,
            walletId,
            type: "EXPENSE",
            amount: "20.00",
            description: "Bus",
            frequency: "DAILY",
            weekDays: [],
            months: [],
            notificationTimes: ["07:00", "18:00"],
            startAt: at,
            nextOccurrenceAt: at,
            active: true,
            createdAt: at,
            updatedAt: at,
          },
        ])
      ).status
    ).toBe(200);
    expect(
      (
        await put("transactions", [
          {
            id: transactionId,
            walletId,
            amount: "-20.00",
            description: "Bus",
            type: "EXPENSE",
            recurringTransactionId: ruleId,
            createdAt: at,
            updatedAt: at,
          },
        ])
      ).status
    ).toBe(200);
    const res = await put("recurring-transaction-occurrences", [
      {
        id: `${ruleId}_2026-10-28T07:00:00`,
        recurringTransactionId: ruleId,
        occurrenceAt: at,
        status: "EXECUTED",
        transactionId,
        plannedAmount: "20.00",
        createdAt: at,
      },
    ]);
    expect(res.status).toBe(200);

    const body = (await init(1, 500)).body;
    expect(
      body.transactions.find((t: any) => t.id === transactionId)
        .recurringTransactionId
    ).toBe(ruleId);
    expect(
      body.recurringTransactionOccurrences.map((o: any) => o.transactionId)
    ).toContain(transactionId);
  });
});
