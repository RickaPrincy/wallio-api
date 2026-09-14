import { InitInfoService } from "@wallio/services";

// Builds a fake service exposing the same findAll/count shape InitInfoService
// relies on, backed by a plain in-memory array — no DB/Docker required.
function fakeService<T>(items: T[]) {
  return {
    findAll: jest.fn(async (pagination: { page: number; pageSize: number }) => {
      const start = (pagination.page - 1) * pagination.pageSize;
      return items.slice(start, start + pagination.pageSize);
    }),
    count: jest.fn(async () => items.length),
  };
}

// Drains getByUserId exactly the way the Qt client does: keep requesting
// incrementing pages until every array in the response comes back empty.
async function drainAll(service: InitInfoService, pageSize: number) {
  const collected = {
    wallets: [] as any[],
    transactions: [] as any[],
    projects: [] as any[],
    projectItems: [] as any[],
    labels: [] as any[],
  };

  let page = 1;
  const maxPages = 1000;
  for (let i = 0; i < maxPages; i++) {
    const info = await service.getByUserId("user-1", { page, pageSize });
    collected.wallets.push(...info.wallets);
    collected.transactions.push(...info.transactions);
    collected.projects.push(...info.projects);
    collected.projectItems.push(...info.projectItems);
    collected.labels.push(...info.labels);

    const allEmpty =
      info.wallets.length === 0 &&
      info.transactions.length === 0 &&
      info.projects.length === 0 &&
      info.projectItems.length === 0 &&
      info.labels.length === 0;

    if (allEmpty) return collected;
    page++;
  }

  throw new Error("drainAll did not terminate — possible infinite loop");
}

function buildService(counts: [number, number, number, number, number]) {
  const wallets = Array.from({ length: counts[0] }, (_, i) => ({ id: `wallet-${i}` }));
  const transactions = Array.from({ length: counts[1] }, (_, i) => ({ id: `tx-${i}` }));
  const projects = Array.from({ length: counts[2] }, (_, i) => ({ id: `project-${i}` }));
  const projectItems = Array.from({ length: counts[3] }, (_, i) => ({ id: `item-${i}` }));
  const labels = Array.from({ length: counts[4] }, (_, i) => ({ id: `label-${i}` }));

  const service = new InitInfoService(
    fakeService(wallets) as any,
    fakeService(transactions) as any,
    fakeService(projects) as any,
    fakeService(projectItems) as any,
    fakeService(labels) as any
  );

  return { service, wallets, transactions, projects, projectItems, labels };
}

describe("InitInfoService.getByUserId (full drain)", () => {
  const scenarios: Array<[number, number, number, number, number]> = [
    [3, 2, 4, 1, 5],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [5, 5, 5, 5, 5],
    [2, 3, 0, 7, 0],
    [10, 0, 10, 0, 10],
    [1, 1, 1, 1, 1],
    [7, 7, 7, 7, 7],
    [50, 37, 12, 99, 3],
  ];
  const pageSizes = [1, 2, 3, 5, 7, 10, 100];

  for (const counts of scenarios) {
    for (const pageSize of pageSizes) {
      it(`drains every item exactly once for counts=${JSON.stringify(counts)} pageSize=${pageSize}`, async () => {
        const { service, wallets, transactions, projects, projectItems, labels } =
          buildService(counts);

        const collected = await drainAll(service, pageSize);

        expect(collected.wallets).toEqual(wallets);
        expect(collected.transactions).toEqual(transactions);
        expect(collected.projects).toEqual(projects);
        expect(collected.projectItems).toEqual(projectItems);
        expect(collected.labels).toEqual(labels);
      });
    }
  }
});
