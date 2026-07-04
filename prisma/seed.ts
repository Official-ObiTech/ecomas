import { PrismaClient, ProductStatus } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: { name: "Clothing", slug: "clothing" },
  });

  const collection = await prisma.collection.upsert({
    where: { slug: "new-arrivals" },
    update: {},
    create: { name: "New Arrivals", slug: "new-arrivals" },
  });

  await prisma.product.upsert({
    where: { slug: "sample-tee" },
    update: {},
    create: {
      name: "Sample Tee",
      slug: "sample-tee",
      description: "A placeholder product for testing.",
      price: 1500000, // ₦15,000.00 in kobo
      stock: 25,
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: category.id,
      images: [],
      collections: { connect: { id: collection.id } },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());