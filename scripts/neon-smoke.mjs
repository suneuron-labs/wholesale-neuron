import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sessions = await prisma.session.count();
const settings = await prisma.appSettings.findMany({
  select: {
    shop: true,
    isInstalled: true,
    discountGid: true,
    validationGid: true,
    paymentGid: true,
  },
});
const webhooks = await prisma.webhookDelivery.groupBy({
  by: ["status"],
  _count: true,
});

console.log(JSON.stringify({ sessions, settings, webhooks }, null, 2));
await prisma.$disconnect();
