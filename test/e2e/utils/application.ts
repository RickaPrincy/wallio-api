import { Test } from "@nestjs/testing";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { INestApplication } from "@nestjs/common";

import {
  FirebaseAppService,
  FirebaseAuthService,
} from "@wallio/services/firebase";

import { AppModule } from "../../../src/app.module";
import { createPostgresContainer } from "./testcontainer";
import { SEEDER_NAME, SeederModule, SeederRunnable } from "../seeders";
import { createFirebaseMock } from "../../mocks/services";
import { JANE_FIREBASE_USER, JOHN_FIREBASE_USER } from "../../mocks";

export type TestApp = {
  app: INestApplication;
  container: GenericContainer;
  startedContainer: StartedTestContainer;
  close: () => Promise<void>;
};

export const createTestApp = async (): Promise<TestApp> => {
  const { container, dbUrl, startedContainer } =
    await createPostgresContainer();

  process.env.DATABASE_URL = dbUrl;

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule, SeederModule],
  })
    .overrideProvider(FirebaseAppService)
    .useValue(null)
    .overrideProvider(FirebaseAuthService)
    .useValue(createFirebaseMock([JOHN_FIREBASE_USER, JANE_FIREBASE_USER]))
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const seeder = app.get<SeederRunnable>(SEEDER_NAME);
  await seeder.run();

  return {
    app,
    container,
    startedContainer,
    close: async () => {
      startedContainer.stop();
      app.close();
    },
  };
};
