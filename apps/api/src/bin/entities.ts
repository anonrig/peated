import { program } from "commander";
import { eq, inArray } from "drizzle-orm";
import { bottles, bottlesToDistillers, entities } from "~/db/schema";
import generateEntityDescription from "~/tasks/generateEntityDescription";
import { db } from "../db";

program.name("entities").description("CLI for assisting with entity admin");

program
  .command("generate-descriptions")
  .description("Generate entity descriptions")
  .argument("[entityId]")
  .option("--only-missing")
  .action(async (entityId, options) => {
    const query = await db.query.entities.findMany({
      where: entityId
        ? (entities, { eq }) => eq(entities.id, entityId)
        : options.onlyMissing
        ? (entities, { isNull }) => isNull(entities.description)
        : undefined,
    });
    for (const entity of query) {
      console.log(
        `Generating description for Entity ${entity.id} (${entity.name}).`,
      );
      const description = await generateEntityDescription(entity.name);
      await db
        .update(entities)
        .set({
          description,
        })
        .where(eq(entities.id, entity.id));
    }
  });

// TODO: move logic to utility + tests
program
  .command("merge")
  .description("Merge two or more entities together")
  .argument("<rootEntityId>")
  .argument("<entityIds...>")
  .action(async (rootEntityId, entityIds, options) => {
    const rootEntity = await db.query.entities.findFirst({
      where: (entities, { eq }) => eq(entities.id, rootEntityId),
    });
    if (!rootEntity) {
      throw new Error("Unable to find root entity");
    }
    const query = await db.query.entities.findMany({
      where: (entities, { inArray }) => inArray(entities.id, entityIds),
    });
    if (query.length != entityIds.length) {
      throw new Error("Unable to find all entities");
    }

    console.log(
      `Merging entities ${entityIds.join(", ")} into ${rootEntityId}.`,
    );

    // TODO: this doesnt handle duplicate bottles
    await db.transaction(async (tx) => {
      await tx
        .update(bottles)
        .set({
          brandId: rootEntityId,
        })
        .where(inArray(bottles.brandId, entityIds));

      await tx
        .update(bottles)
        .set({
          bottlerId: rootEntityId,
        })
        .where(inArray(bottles.bottlerId, entityIds));

      await tx
        .update(bottlesToDistillers)
        .set({
          distillerId: rootEntityId,
        })
        .where(inArray(bottlesToDistillers.distillerId, entityIds));

      // TODO: update entities.totalTastings

      await tx.delete(entities).where(inArray(entities.id, entityIds));
    });
  });

program.parseAsync();
