import { syncCatalog } from "./catalog";
import { exerciseCatalog } from "./exercises";

async function main() {
  console.log(`Seeding ${exerciseCatalog.length} catalog exercises...`);
  await syncCatalog();
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
