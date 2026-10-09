import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const shop = "sanity-check.myshopify.com";

try {
  await prisma.appSettings.upsert({
    where: { shop },
    create: { shop, isInstalled: true },
    update: { isInstalled: true },
  });

  const row = await prisma.appSettings.findUnique({ where: { shop } });
  const counts = {
    sessions: await prisma.session.count(),
    appSettings: await prisma.appSettings.count(),
    webhookDeliveries: await prisma.webhookDelivery.count(),
  };

  await prisma.appSettings.delete({ where: { shop } });

  console.log(
    JSON.stringify(
      {
        ok: true,
        wroteAndRead: row?.shop === shop,
        cleanedUp: true,
        counts,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
