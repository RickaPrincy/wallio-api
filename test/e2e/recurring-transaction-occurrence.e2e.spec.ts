import * as request from "supertest";
import { createTestApp, TestApp } from "./utils/application";
import { randomUUID } from "crypto";
import { JOHN, JANE } from "../mocks";

describe("RecurringTransactionOccurrenceController (e2e)", () => {
  let testApp: TestApp;

  const auth = (user: typeof JOHN) =>
    ["Authorization", "Bearer " + user.firebaseId] as const;

  const put = (user: typeof JOHN, body: object[]) =>
    request(testApp.app.getHttpServer())
      .put(`/users/${user.id}/recurring-transaction-occurrences`)
      .set(...auth(user))
      .send(body);

  const init = (user: typeof JOHN) =>
    request(testApp.app.getHttpServer())
      .get(`/users/${user.id}/init?page=1&pageSize=500`)
      .set(...auth(user));

  let walletId: string;
  let ruleId: string;
  let transactionId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    const server = testApp.app.getHttpServer();
    const now = new Date().toISOString();

    walletId = randomUUID();
    ruleId = randomUUID();
    transactionId = randomUUID();

    expect(
      (
        await request(server)
          .put(`/users/${JANE.id}/wallets`)
          .set(...auth(JANE))
          .send([
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
        await request(server)
          .put(`/users/${JANE.id}/recurring-transactions`)
          .set(...auth(JANE))
          .send([
            {
              id: ruleId,
              walletId,
              amount: "100.00",
              description: "Rent",
              frequency: "MONTHLY",
              dayOfMonth: 5,
              notificationTimes: ["08:00"],
              startAt: now,
              nextOccurrenceAt: now,
              createdAt: now,
              updatedAt: now,
            },
          ])
      ).status
    ).toBe(200);

    expect(
      (
        await request(server)
          .put(`/users/${JANE.id}/transactions`)
          .set(...auth(JANE))
          .send([
            {
              id: transactionId,
              walletId,
              amount: "-100.00",
              description: "Rent",
              type: "EXPENSE",
              recurringTransactionId: ruleId,
              createdAt: now,
              updatedAt: now,
            },
          ])
      ).status
    ).toBe(200);
  });

  const occurrence = (overrides: Record<string, any> = {}) => ({
    id: `${ruleId}_${randomUUID()}`,
    recurringTransactionId: ruleId,
    occurrenceAt: new Date().toISOString(),
    status: "DISMISSED",
    plannedAmount: "100.00",
    ...overrides,
  });

  it("should refuse a PENDING occurrence", async () => {
    const res = await put(JANE, [occurrence({ status: "PENDING" })]);
    expect(res.status).toBe(400);
  });

  it("should refuse an occurrence of someone else's rule", async () => {
    const res = await put(JOHN, [occurrence()]);
    expect(res.status).toBe(400);
  });

  it("should refuse a rule id that does not exist", async () => {
    const res = await put(JANE, [
      occurrence({ recurringTransactionId: randomUUID() }),
    ]);
    expect(res.status).toBe(400);
  });

  it("should store an executed occurrence with its transaction", async () => {
    const item = occurrence({ status: "EXECUTED", transactionId });
    const res = await put(JANE, [item]);
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe(item.id);
    expect(res.body[0].transactionId).toBe(transactionId);
  });

  it("should keep an occurrence final once stored", async () => {
    const item = occurrence({ status: "DISMISSED" });
    expect((await put(JANE, [item])).status).toBe(200);

    const res = await put(JANE, [
      { ...item, status: "EXECUTED", transactionId },
    ]);
    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe("DISMISSED");
    expect(res.body[0].transactionId).toBeFalsy();
  });

  it("should send the occurrences back in the init", async () => {
    const item = occurrence();
    expect((await put(JANE, [item])).status).toBe(200);

    const res = await init(JANE);
    expect(res.status).toBe(200);
    const ids = res.body.recurringTransactionOccurrences.map((o: any) => o.id);
    expect(ids).toContain(item.id);
  });

  afterAll(async () => {
    await testApp.close();
  });
});
