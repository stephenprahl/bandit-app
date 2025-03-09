import { db } from "@/lib/prisma";

/**
 * Creates a new sprint or updates an existing one with the same name
 * @param {Object} data - The sprint data
 * @returns {Promise<Object>} The created or updated sprint
 */
export const upsertSprint = async (data) => {
  return await db.sprint.upsert({
    where: { name: data.name },
    update: { ...data },
    create: { ...data }
  });
}