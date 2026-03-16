import * as request from "supertest";
import { createTestApp, TestApp } from "./utils/application";
import { DUMMY_1, DUMMY_2, DUMMY_3, JOHN_FIREBASE_USER } from "../mocks";

describe("AuthController (e2e)", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  it("ping should be excludes from any verification", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get("/ping")
      .set("Authorization", "invalid");

    expect(res.text).toBe("pong");
  });

  it("public /dummies should passes if correct token is not present", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get("/dummies")
      .set("Authorization", "incorrect");

    expect(res.body).toStrictEqual([DUMMY_1, DUMMY_2, DUMMY_3]);
  });

  it("public /dummies should throw forbidden if invalid token is passes", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get("/dummies")
      .set("Authorization", "Bearer invalid");

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: "Forbidden",
      statusCode: 403,
    });
  });

  it("public /dummies should passes if valid token is passes", async () => {
    const res = await request(testApp.app.getHttpServer())
      .get("/dummies")
      .set("Authorization", JOHN_FIREBASE_USER.uid);

    expect(res.body).toStrictEqual([DUMMY_1, DUMMY_2, DUMMY_3]);
  });

  afterAll(async () => {
    await testApp.close();
  });
});
