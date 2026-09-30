import * as request from "supertest";
import { createTestApp, TestApp } from "./utils/application";
import { randomUUID } from "crypto";
import { JOHN, JANE } from "../mocks";

describe("WalletController (e2e)", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  it("should throw forbidden when access others wallets", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}/wallets`)
      .set("Authorization", "Bearer " + JOHN.firebaseId);

    expect(res.status).toBe(403);
  });

  it("should return empty wallets", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}/wallets`)
      .set("Authorization", "Bearer " + JANE.firebaseId);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  it("should keep the wallet currency, MGA by default", async () => {
    const now = new Date().toISOString();
    const base = {
      name: "W",
      balance: "1.00",
      type: "CASH",
      createdAt: now,
      updatedAt: now,
    };
    const euroId = randomUUID();
    const defaultId = randomUUID();

    const res = await request(testApp.app.getHttpServer())
      .put(`/users/${JANE.id}/wallets`)
      .set("Authorization", "Bearer " + JANE.firebaseId)
      .send([
        { ...base, id: euroId, currency: "EUR" },
        { ...base, id: defaultId },
      ]);
    expect(res.status).toBe(200);

    const wallets = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}/wallets`)
      .set("Authorization", "Bearer " + JANE.firebaseId);
    const byId = Object.fromEntries(
      wallets.body.map((w) => [w.id, w.currency])
    );
    expect(byId[euroId]).toBe("EUR");
    expect(byId[defaultId]).toBe("MGA");
  });

  it("should reject an invalid currency", async () => {
    const now = new Date().toISOString();
    const res = await request(testApp.app.getHttpServer())
      .put(`/users/${JANE.id}/wallets`)
      .set("Authorization", "Bearer " + JANE.firebaseId)
      .send([
        {
          id: randomUUID(),
          name: "W",
          balance: "1.00",
          type: "CASH",
          currency: "euro",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    expect(res.status).toBe(400);
  });

  it("should refuse a negative balance on a debt or a receivable", async () => {
    const now = new Date().toISOString();
    const put = (type: string, balance: string) =>
      request(testApp.app.getHttpServer())
        .put(`/users/${JANE.id}/wallets`)
        .set("Authorization", "Bearer " + JANE.firebaseId)
        .send([
          {
            id: randomUUID(),
            name: "Owed",
            balance,
            type,
            createdAt: now,
            updatedAt: now,
          },
        ]);

    expect((await put("DEBT", "-1.00")).status).toBe(400);
    expect((await put("RECEIVABLE", "-5000.00")).status).toBe(400);
    expect((await put("DEBT", "500.00")).status).toBe(200);
    expect((await put("RECEIVABLE", "0.00")).status).toBe(200);
  });

  it("should keep the person of a transaction", async () => {
    const now = new Date().toISOString();
    const walletId = randomUUID();
    const server = testApp.app.getHttpServer();
    const auth = ["Authorization", "Bearer " + JANE.firebaseId] as const;

    await request(server)
      .put(`/users/${JANE.id}/wallets`)
      .set(...auth)
      .send([
        {
          id: walletId,
          name: "Friends",
          balance: "0.00",
          type: "RECEIVABLE",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    const res = await request(server)
      .put(`/users/${JANE.id}/transactions`)
      .set(...auth)
      .send([
        {
          id: randomUUID(),
          walletId,
          amount: "3000.00",
          description: "Loan",
          counterparty: "Rakoto",
          createdAt: now,
          updatedAt: now,
        },
      ]);

    expect(res.status).toBe(200);
    expect(res.body[0].counterparty).toBe("Rakoto");
  });

  afterAll(async () => {
    await testApp.close();
  });
});
