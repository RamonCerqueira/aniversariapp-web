const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const u = await p.user.count();
  const s = await p.supplierProfile.count();
  console.log('users:', u, 'suppliers:', s);
  const suppliers = await p.supplierProfile.findMany({
    include: { user: true }
  });
  console.log('all suppliers:', suppliers.map(x => ({
    id: x.id,
    companyName: x.companyName,
    category: x.category,
    city: x.city,
    plan: x.user.plan,
    role: x.user.role
  })));
  process.exit(0);
}
run().catch(console.error);
