"use server";

import { db } from "@/lib/prisma";
import { upsertSprint } from "@/lib/sprint";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { sprints: { orderBy: { createdAt: "desc" } } },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found");
  }

  try {
    // Using upsert instead of create
    const sprint = await upsertSprint({
      ...data,
      projectId: projectId,
    });

    return sprint;
  } catch (error) {
    throw new Error(`Failed to create sprint: ${error.message}`);
  }
}

export async function updateSprintStatus(sprintId, newStatus) {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { project: true },
    });
    console.log(sprint, orgRole);

    if (!sprint) {
      throw new Error("Sprint not found");
    }

    if (sprint.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    if (orgRole !== "org:admin") {
      throw new Error("Only Admin can make this change");
    }

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      throw new Error("Cannot start sprint outside of its date range");
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      throw new Error("Can only complete an active sprint");
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status: newStatus },
    });

    return { success: true, sprint: updatedSprint };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAllSprints() {
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const sprints = await db.sprint.findMany({
    where: {
      project: {
        organizationId: orgId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sprints;
}

export async function updateSprintDates(sprintId, startDate, endDate) {
  const { userId, orgId, orgRole } = auth();
  if (!userId || !orgId || orgRole !== "org:admin") {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: { project: true },
  });

  if (!sprint || sprint.project.organizationId !== orgId) {
    throw new Error("Sprint not found or unauthorized");
  }

  // Optionally add validation checks here

  const updatedSprint = await db.sprint.update({
    where: { id: sprintId },
    data: { startDate, endDate },
  });

  return { success: true, sprint: updatedSprint };
}
