import * as request from "supertest";
import { createTestApp, TestApp } from "./utils/application";
import { JOHN, JANE } from "../mocks";

describe("WalletController (e2e)", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  it("should throw forbidden when access others wallet", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}/wallets/dummy-wallet-id`)
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

  afterAll(async () => {
    await testApp.close();
  });
});
