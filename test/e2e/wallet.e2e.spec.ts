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

  afterAll(async () => {
    await testApp.close();
  });
});
