import * as request from "supertest";
import { createTestApp, TestApp } from "./utils/application";
import { randomUUID } from "crypto";
import { JOHN, JANE } from "../mocks";

describe("RecurringTransactionController (e2e)", () => {
  let testApp: TestApp;

  const auth = (user: typeof JOHN) =>
    ["Authorization", "Bearer " + user.firebaseId] as const;

  const put = (user: typeof JOHN, body: object[]) =>
    request(testApp.app.getHttpServer())
      .put(`/users/${user.id}/recurring-transactions`)
      .set(...auth(user))
      .send(body);

  const get = (user: typeof JOHN) =>
    request(testApp.app.getHttpServer())
      .get(`/users/${user.id}/recurring-transactions`)
      .set(...auth(user));

  let janeWalletId: string;

  beforeAll(async () => {
    testApp = await createTestApp();

    const now = new Date().toISOString();
    janeWalletId = randomUUID();
    const res = await request(testApp.app.getHttpServer())
      .put(`/users/${JANE.id}/wallets`)
      .set(...auth(JANE))
      .send([
        {
          id: janeWalletId,
          name: "Wallet",
          balance: "1000.00",
          type: "CASH",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    expect(res.status).toBe(200);
  });

  const base = (id: string, overrides: Partial<Record<string, any>> = {}) => {
    const now = new Date().toISOString();
    return {
      id,
      walletId: janeWalletId,
      amount: "100.00",
      description: "Rent for {{CURRENT_MONTH}}",
      frequency: "MONTHLY",
      dayOfMonth: 5,
      notificationTimes: ["08:00", "20:30"],
      startAt: now,
      nextOccurrenceAt: now,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  };

  it("should throw forbidden when access others recurring transactions", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}/recurring-transactions`)
      .set(...auth(JOHN));

    expect(res.status).toBe(403);
  });

  it("should return empty recurring transactions", async () => {
    const res = await get(JANE);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  it("should reject an invalid frequency", async () => {
    const res = await put(JANE, [base(randomUUID(), { frequency: "YEARLY" })]);
    expect(res.status).toBe(400);
  });

  it("should reject a MONTHLY recurrence without a dayOfMonth", async () => {
    const res = await put(JANE, [
      base(randomUUID(), { frequency: "MONTHLY", dayOfMonth: undefined }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should reject a dayOfMonth when the frequency is not MONTHLY", async () => {
    const res = await put(JANE, [
      base(randomUUID(), { frequency: "DAILY", dayOfMonth: 5 }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should reject an out-of-range dayOfMonth", async () => {
    expect(
      (await put(JANE, [base(randomUUID(), { dayOfMonth: 0 })])).status
    ).toBe(400);
    expect(
      (await put(JANE, [base(randomUUID(), { dayOfMonth: 32 })])).status
    ).toBe(400);
  });

  it("should reject a WEEKLY recurrence without weekDays", async () => {
    const res = await put(JANE, [
      base(randomUUID(), {
        frequency: "WEEKLY",
        dayOfMonth: undefined,
        weekDays: [],
      }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should reject weekDays when the frequency is not WEEKLY", async () => {
    const res = await put(JANE, [base(randomUUID(), { weekDays: ["MONDAY"] })]);
    expect(res.status).toBe(400);
  });

  it("should reject an invalid weekday", async () => {
    const res = await put(JANE, [
      base(randomUUID(), {
        frequency: "WEEKLY",
        dayOfMonth: undefined,
        weekDays: ["FUNDAY"],
      }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should accept a WEEKLY recurrence with multiple weekDays", async () => {
    const res = await put(JANE, [
      base(randomUUID(), {
        frequency: "WEEKLY",
        dayOfMonth: undefined,
        weekDays: ["MONDAY", "THURSDAY"],
      }),
    ]);
    expect(res.status).toBe(200);
    expect(res.body[0].weekDays).toEqual(["MONDAY", "THURSDAY"]);
  });

  it("should reject a malformed notification time", async () => {
    const res = await put(JANE, [
      base(randomUUID(), { notificationTimes: ["8:00"] }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should reject a TRANSFER type", async () => {
    const res = await put(JANE, [base(randomUUID(), { type: "TRANSFER" })]);
    expect(res.status).toBe(400);
  });

  it("should reject a counterparty longer than 80 characters", async () => {
    const res = await put(JANE, [
      base(randomUUID(), { counterparty: "a".repeat(81) }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should round-trip every field on PUT+GET", async () => {
    const id = randomUUID();
    const now = new Date().toISOString();
    const endAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 365
    ).toISOString();
    const payload = base(id, {
      amount: "2500.00",
      description: "Salary for {{CURRENT_MONTH}}",
      counterparty: "Rakoto",
      type: "INCOME",
      frequency: "MONTHLY",
      dayOfMonth: 28,
      notificationTimes: ["09:15", "18:45"],
      nextOccurrenceAt: now,
      lastExecutedAt: now,
      endAt,
    });

    const putRes = await put(JANE, [payload]);
    expect(putRes.status).toBe(200);

    const getRes = await get(JANE);
    expect(getRes.status).toBe(200);
    const created = getRes.body.find((item: any) => item.id === id);
    expect(created).toBeDefined();
    expect(created.walletId).toBe(janeWalletId);
    expect(created.amount).toBe("2500.00");
    expect(created.description).toBe("Salary for {{CURRENT_MONTH}}");
    expect(created.counterparty).toBe("Rakoto");
    expect(created.type).toBe("INCOME");
    expect(created.frequency).toBe("MONTHLY");
    expect(created.dayOfMonth).toBe(28);
    expect(created.notificationTimes).toEqual(["09:15", "18:45"]);
    expect(new Date(created.startAt).toISOString()).toBe(now);
    expect(new Date(created.nextOccurrenceAt).toISOString()).toBe(now);
    expect(new Date(created.lastExecutedAt).toISOString()).toBe(now);
    expect(new Date(created.endAt).toISOString()).toBe(endAt);
  });

  it("should allow endAt to be left unset (recurs forever)", async () => {
    const id = randomUUID();
    const res = await put(JANE, [base(id)]);
    expect(res.status).toBe(200);
    expect(res.body[0].endAt).toBeFalsy();
  });

  it("should round-trip Transaction.recurringTransactionId", async () => {
    const recurringId = randomUUID();
    expect((await put(JANE, [base(recurringId)])).status).toBe(200);

    const transactionId = randomUUID();
    const now = new Date().toISOString();
    const txRes = await request(testApp.app.getHttpServer())
      .put(`/users/${JANE.id}/transactions`)
      .set(...auth(JANE))
      .send([
        {
          id: transactionId,
          walletId: janeWalletId,
          amount: "100.00",
          description: "Rent for October",
          recurringTransactionId: recurringId,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    expect(txRes.status).toBe(200);
    expect(txRes.body[0].recurringTransactionId).toBe(recurringId);

    const getTxRes = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}/transactions`)
      .set(...auth(JANE));
    const found = getTxRes.body.find((t: any) => t.id === transactionId);
    expect(found.recurringTransactionId).toBe(recurringId);
  });

  it("should soft delete a recurring transaction by setting deletedAt", async () => {
    const id = randomUUID();
    expect((await put(JANE, [base(id)])).status).toBe(200);

    const deletedAt = new Date().toISOString();
    const deleteRes = await put(JANE, [base(id, { deletedAt })]);
    expect(deleteRes.status).toBe(200);

    const getRes = await get(JANE);
    const found = getRes.body.find((item: any) => item.id === id);
    expect(found).toBeDefined();
    expect(new Date(found.deletedAt).toISOString()).toBe(deletedAt);
  });

  afterAll(async () => {
    await testApp.close();
  });
});
