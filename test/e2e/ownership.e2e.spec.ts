import * as request from "supertest";
import { randomUUID } from "crypto";
import { createTestApp, TestApp } from "./utils/application";
import { JOHN, JANE } from "../mocks";

const NOW = new Date().toISOString();

const wallet = (id: string) => ({
  id,
  name: "Wallet",
  balance: "100.00",
  type: "CASH",
  createdAt: NOW,
  updatedAt: NOW,
});
const label = (id: string) => ({
  id,
  name: "Food",
  icon: "food",
  color: "#ff0000",
  createdAt: NOW,
  updatedAt: NOW,
});
const project = (id: string) => ({
  id,
  name: "Trip",
  createdAt: NOW,
  updatedAt: NOW,
});
const transaction = (id: string, walletId: string) => ({
  id,
  walletId,
  amount: "10.00",
  description: "Lunch",
  createdAt: NOW,
  updatedAt: NOW,
});
const projectItem = (
  id: string,
  projectId: string,
  transactionId?: string
) => ({
  id,
  projectId,
  transactionId,
  description: "Tickets",
  amount: "10.00",
  createdAt: NOW,
  updatedAt: NOW,
});

describe("Ownership on PUT routes (e2e)", () => {
  let testApp: TestApp;

  const janeWalletId = randomUUID();
  const janeLabelId = randomUUID();
  const janeProjectId = randomUUID();
  const janeTransactionId = randomUUID();
  const janeProjectItemId = randomUUID();
  const johnWalletId = randomUUID();
  const johnProjectId = randomUUID();

  const put = (user: typeof JOHN, path: string, body: object[]) =>
    request(testApp.app.getHttpServer())
      .put(`/users/${user.id}/${path}`)
      .set("Authorization", "Bearer " + user.firebaseId)
      .send(body);

  const get = (user: typeof JOHN, path: string) =>
    request(testApp.app.getHttpServer())
      .get(`/users/${user.id}/${path}`)
      .set("Authorization", "Bearer " + user.firebaseId);

  beforeAll(async () => {
    testApp = await createTestApp();

    expect((await put(JANE, "wallets", [wallet(janeWalletId)])).status).toBe(
      200
    );
    expect((await put(JANE, "labels", [label(janeLabelId)])).status).toBe(200);
    expect((await put(JANE, "projects", [project(janeProjectId)])).status).toBe(
      200
    );
    expect(
      (
        await put(JANE, "transactions", [
          transaction(janeTransactionId, janeWalletId),
        ])
      ).status
    ).toBe(200);
    expect(
      (
        await put(JANE, "project-items", [
          projectItem(janeProjectItemId, janeProjectId),
        ])
      ).status
    ).toBe(200);

    expect((await put(JOHN, "wallets", [wallet(johnWalletId)])).status).toBe(
      200
    );
    expect((await put(JOHN, "projects", [project(johnProjectId)])).status).toBe(
      200
    );
  });

  it("refuses to overwrite a wallet of someone else", async () => {
    const res = await put(JOHN, "wallets", [
      { ...wallet(janeWalletId), name: "Stolen" },
    ]);
    expect(res.status).toBe(400);

    const janeWallets = await get(JANE, "wallets");
    expect(janeWallets.body).toHaveLength(1);
    expect(janeWallets.body[0].name).toBe("Wallet");
  });

  it("refuses to overwrite a label of someone else", async () => {
    const res = await put(JOHN, "labels", [
      { ...label(janeLabelId), name: "Stolen" },
    ]);
    expect(res.status).toBe(400);

    const janeLabels = await get(JANE, "labels");
    expect(janeLabels.body[0].name).toBe("Food");
  });

  it("refuses to overwrite a project of someone else", async () => {
    const res = await put(JOHN, "projects", [
      { ...project(janeProjectId), name: "Stolen" },
    ]);
    expect(res.status).toBe(400);

    const janeProjects = await get(JANE, "projects");
    expect(janeProjects.body[0].name).toBe("Trip");
  });

  it("refuses to move a transaction of someone else into its own wallet", async () => {
    const res = await put(JOHN, "transactions", [
      transaction(janeTransactionId, johnWalletId),
    ]);
    expect(res.status).toBe(400);

    const janeTransactions = await get(JANE, "transactions");
    expect(janeTransactions.body).toHaveLength(1);
    expect(janeTransactions.body[0].walletId).toBe(janeWalletId);
  });

  it("refuses to move a project item of someone else into its own project", async () => {
    const res = await put(JOHN, "project-items", [
      projectItem(janeProjectItemId, johnProjectId),
    ]);
    expect(res.status).toBe(400);

    const janeItems = await get(JANE, "project-items");
    expect(janeItems.body).toHaveLength(1);
    expect(janeItems.body[0].projectId).toBe(janeProjectId);
  });

  it("refuses to link a project item to a transaction of someone else", async () => {
    const res = await put(JOHN, "project-items", [
      projectItem(randomUUID(), johnProjectId, janeTransactionId),
    ]);
    expect(res.status).toBe(400);
  });

  it("still lets a user update its own rows", async () => {
    const res = await put(JANE, "wallets", [
      { ...wallet(janeWalletId), name: "Renamed" },
    ]);
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Renamed");
  });

  afterAll(async () => {
    await testApp.close();
  });
});
