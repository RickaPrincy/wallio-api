import * as request from "supertest";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestApp, TestApp } from "./utils/application";
import { FirebaseAuthService } from "@wallio/services/firebase";
import { Project, ProjectItem, Transaction, Wallet } from "@wallio/entities";
import { JOHN, JANE } from "../mocks";

const NOW = new Date().toISOString();

describe("UserController (e2e)", () => {
  let testApp: TestApp;

  const put = (user: typeof JOHN, path: string, body: object[]) =>
    request(testApp.app.getHttpServer())
      .put(`/users/${user.id}/${path}`)
      .set("Authorization", "Bearer " + user.firebaseId)
      .send(body);

  const deleteUser = (as: typeof JOHN, id: string) =>
    request(testApp.app.getHttpServer())
      .delete(`/users/${id}`)
      .set("Authorization", "Bearer " + as.firebaseId);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  it("should throw forbidden when deleting someone else", async () => {
    const res = await deleteUser(JANE, JOHN.id);

    expect(res.status).toBe(403);
  });

  it("should delete the user, all its data and its Firebase account", async () => {
    const walletId = randomUUID();
    const projectId = randomUUID();
    const transactionId = randomUUID();
    await put(JOHN, "wallets", [
      {
        id: walletId,
        name: "Cash",
        balance: "10.00",
        type: "CASH",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]);
    await put(JOHN, "projects", [
      { id: projectId, name: "Trip", createdAt: NOW, updatedAt: NOW },
    ]);
    await put(JOHN, "transactions", [
      {
        id: transactionId,
        walletId,
        amount: "5.00",
        description: "Lunch",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]);
    await put(JOHN, "project-items", [
      {
        id: randomUUID(),
        projectId,
        transactionId,
        description: "Tickets",
        amount: "5.00",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]);

    const firebase = testApp.app.get(FirebaseAuthService);
    const deleteFirebaseUser = jest.spyOn(firebase, "deleteUser");

    const res = await deleteUser(JOHN, JOHN.id);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(JOHN.id);
    expect(deleteFirebaseUser).toHaveBeenCalledWith(JOHN.firebaseId);

    const dataSource = testApp.app.get(DataSource);
    for (const entity of [Wallet, Project, Transaction, ProjectItem]) {
      expect(
        await dataSource.getRepository(entity).count({ withDeleted: true })
      ).toBe(0);
    }

    const after = await request(testApp.app.getHttpServer())
      .get(`/users/${JOHN.id}`)
      .set("Authorization", "Bearer " + JOHN.firebaseId);
    expect(after.status).toBe(403);
  });

  it("should keep the data when the Firebase deletion fails", async () => {
    const firebase = testApp.app.get(FirebaseAuthService);
    jest.spyOn(firebase, "deleteUser").mockRejectedValueOnce(new Error("down"));

    const res = await deleteUser(JANE, JANE.id);
    expect(res.status).toBe(500);

    const stillThere = await request(testApp.app.getHttpServer())
      .get(`/users/${JANE.id}`)
      .set("Authorization", "Bearer " + JANE.firebaseId);
    expect(stillThere.status).toBe(200);
  });

  afterAll(async () => {
    await testApp.close();
  });
});
