/**
 * prisma/seed.ts
 * Bootstrap seeder for Feature Flag schema
 *
 * Requirements:
 *  - @prisma/client (and prisma generate run)
 *  - typescript (if running via ts-node) or compile to JS
 *  - bcrypt (for password hashing)
 *
 * Run:
 *  - npx prisma db seed    (ensure your package.json "prisma": { "seed": "ts-node prisma/seed.ts" })
 *  - or run with ts-node: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function randomToken(length = 48) {
  return crypto.randomBytes(length).toString("hex");
}

async function main() {
  console.log("Starting bootstrap seeder...");

  // Wrap logically related writes in transactions for safety & performance
  // Create core plans, prices, features, limits (idempotent via upsert)
  const plans = await prisma.$transaction(async (tx) => {
    const freePlan = await tx.plan.upsert({
      where: { slug: "free" },
      update: {
        name: "Free",
        description: "Bootstrap free tier with minimal limits",
      },
      create: {
        name: "Free",
        slug: "free",
        description: "Bootstrap free tier with minimal limits",
        isActive: true,
      },
    });

    const starterPlan = await tx.plan.upsert({
      where: { slug: "starter" },
      update: {
        name: "Starter",
        description: "Small teams plan",
      },
      create: {
        name: "Starter",
        slug: "starter",
        description: "Small teams plan",
        isActive: true,
      },
    });

    // price records
    await tx.price.upsert({
      where: { planId_currency: { planId: freePlan.id, currency: "USD" } as any },
      update: { amount: 0, billingCycle: "monthly" },
      create: {
        planId: freePlan.id,
        currency: "USD",
        amount: 0,
        billingCycle: "monthly",
      },
    });

    await tx.price.upsert({
      where: { planId_currency: { planId: starterPlan.id, currency: "USD" } as any },
      update: { amount: 49, billingCycle: "monthly" },
      create: {
        planId: starterPlan.id,
        currency: "USD",
        amount: 49,
        billingCycle: "monthly",
      },
    });

    // plan features & limits (small set)
    const [pf1] = await Promise.all([
      tx.planFeature.upsert({
        where: { planId_featureKey: { planId: starterPlan.id, featureKey: "flags" } as any },
        update: { displayName: "Feature flags" },
        create: {
          planId: starterPlan.id,
          featureKey: "flags",
          displayName: "Feature flags",
          description: "Number of flags included",
        },
      }),
    ]);

    await tx.planLimit.upsert({
      where: { planId_limitKey: { planId: freePlan.id, limitKey: "flags" } as any },
      update: { limitValue: 5 },
      create: { planId: freePlan.id, limitKey: "flags", limitValue: 5 },
    });

    await tx.planLimit.upsert({
      where: { planId_limitKey: { planId: starterPlan.id, limitKey: "flags" } as any },
      update: { limitValue: 200 },
      create: { planId: starterPlan.id, limitKey: "flags", limitValue: 200 },
    });

    return { freePlan, starterPlan };
  });

  // Create a system admin user (idempotent)
  const adminPassword = "ChangeMe#123"; // bootstrap only — rotate in production
  const adminHash = await hashPassword(adminPassword);

  const admin = await prisma.adminb.upsert({
    where: { email: "admin@yourorg.com" },
    update: { name: "System Admin" },
    create: {
      name: "System Admin",
      email: "admin@yourorg.com",
      password: adminHash,
      role: "super",
    },
  });

  // Create a demo user + workspace + membership
  const userPassword = "TestUser#123"; // bootstrap only
  const userHash = await hashPassword(userPassword);

  const user = await prisma.user.upsert({
    where: { email: "owner@acme.com" },
    update: {
      name: "Acme Owner",
    },
    create: {
      name: "Acme Owner",
      email: "owner@acme.com",
      password: userHash,
      emailVerified: true,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-workspace" },
    update: { name: "Acme Workspace" },
    create: {
      name: "Acme Workspace",
      slug: "acme-workspace",
      billingEmail: user.email,
      ownerId: user.id,
    },
  });

  // workspace member
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } as any },
    update: { role: "owner" },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
      joinedAt: new Date(),
    },
  });

  // Invite sample (not accepted) — useful for UI flows
  await prisma.invite.upsert({
    where: { email_workspaceId: { email: "invitee@acme.com", workspaceId: workspace.id } as any },
    update: { status: "pending" },
    create: {
      email: "invitee@acme.com",
      workspaceId: workspace.id,
      role: "developer",
      token: randomToken(16),
      status: "pending",
      invitedById: user.id,
    },
  });

  // API token for automation / CLI
  await prisma.apiToken.upsert({
    where: { name_workspaceId: { name: "bootstrap-cli", workspaceId: workspace.id } as any },
    update: { token: randomToken(24), lastUsedAt: null },
    create: {
      name: "bootstrap-cli",
      workspaceId: workspace.id,
      token: randomToken(24),
      scopes: ["flags:read", "flags:write", "projects:read"],
    },
  });

  // Project -> environment -> sdkKey
  const project = await prisma.project.upsert({
    where: { name_workspaceId: { name: "Default Project", workspaceId: workspace.id } as any },
    update: { description: "Default project to hold flags" },
    create: {
      name: "Default Project",
      workspaceId: workspace.id,
      description: "Default project to hold flags",
    },
  });

  const environment = await prisma.environment.upsert({
    where: { name_projectId: { name: "development", projectId: project.id } as any },
    update: { isProd: false },
    create: {
      name: "development",
      projectId: project.id,
      isProd: false,
    },
  });

  const sdkKey = await prisma.sdkkey.upsert({
    where: { name_environmentId: { name: "server-key", environmentId: environment.id } as any },
    update: { key: randomToken(20) },
    create: {
      name: "server-key",
      environmentId: environment.id,
      key: randomToken(20),
      type: "server",
      createdById: user.id,
    },
  });

  // A sample flag and ruleset
  const flag = await prisma.flag.upsert({
    where: { key_projectId: { key: "enable_new_ui", projectId: project.id } as any },
    update: { description: "Toggle for new UI" },
    create: {
      key: "enable_new_ui",
      name: "Enable New UI",
      description: "Toggle for enabling the new UI for testing",
      projectId: project.id,
      defaultValue: "false",
      createdById: user.id,
      status: "active",
    },
  });

  await prisma.flagRuleSet.upsert({
    where: { flagId_name: { flagId: flag.id, name: "default" } as any },
    update: { serializedRules: "[]" },
    create: {
      flagId: flag.id,
      name: "default",
      serializedRules: "[]",
      createdById: user.id,
    },
  });

  // A change request for the flag (bootstrap state)
  await prisma.changeRequest.upsert({
    where: { title_workspaceId: { title: "Enable new UI for beta", workspaceId: workspace.id } as any },
    update: { status: "draft" },
    create: {
      title: "Enable new UI for beta",
      workspaceId: workspace.id,
      requestedById: user.id,
      status: "draft",
      description: "Testing rollout via change request",
      targetFlagId: flag.id,
    },
  });

  // Subscription bind to workspace -> plan
  await prisma.subscription.upsert({
    where: { workspaceId: workspace.id },
    update: { planId: plans.starterPlan.id },
    create: {
      workspaceId: workspace.id,
      planId: plans.starterPlan.id,
      status: "active",
      startedAt: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  // Webhook endpoint + sample event (bootstrap)
  const webhookEndpoint = await prisma.webhookEndpoint.upsert({
    where: { url_workspaceId: { url: "https://hooks.example.com/ff", workspaceId: workspace.id } as any },
    update: { isActive: true },
    create: {
      url: "https://hooks.example.com/ff",
      workspaceId: workspace.id,
      isActive: true,
      createdById: user.id,
      secret: randomToken(16),
    },
  });

  await prisma.webhookEvent.createMany({
    data: [
      {
        webhookEndpointId: webhookEndpoint.id,
        eventType: "flag.changed",
        payload: "{}",
        createdAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // Audit log sample
  await prisma.auditLog.create({
    data: {
      action: "seed.bootstrap",
      actorId: admin.id,
      workspaceId: workspace.id,
      details: { message: "Bootstrap seeder run" } as any,
      createdAt: new Date(),
    },
  });

  // Refresh token sample for user (optional)
  await prisma.refreshToken.upsert({
    where: { token: "bootstrap-refresh-token" },
    update: { revoked: false },
    create: {
      token: "bootstrap-refresh-token",
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      revoked: false,
    },
  });

  // Segment (analytics/integrations) record
  await prisma.segment.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "default-segment" } as any },
    update: { config: { writeKey: "seg_write_key_placeholder" } as any },
    create: {
      workspaceId: workspace.id,
      name: "default-segment",
      config: { writeKey: "seg_write_key_placeholder" } as any,
      enabled: false,
    },
  });

  console.log("Bootstrap seeder finished.");
}

main()
  .catch((e) => {
    console.error("Seeder error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
