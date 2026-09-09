import { sql } from "drizzle-orm";
import { db } from "../client";
import { exercises } from "../schema";
import { exerciseCatalog } from "./exercises";

async function main() {
  console.log(`Seeding ${exerciseCatalog.length} catalog exercises...`);

  const inserted = await db
    .insert(exercises)
    .values(exerciseCatalog)
    .onConflictDoNothing({
      target: exercises.name,
      where: sql`${exercises.userId} is null`,
    })
    .returning({ name: exercises.name });

  console.log(`Inserted ${inserted.length} new exercises.`);
  console.log(
    `Skipped ${exerciseCatalog.length - inserted.length} already present in the catalog.`,
  );
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
