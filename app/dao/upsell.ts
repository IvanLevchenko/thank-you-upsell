import prisma from "@/db.server";
import { UpsellFilter } from "@/types/upsell-filter";
import { Prisma } from "@prisma/client";

class UpsellDao {
  static async getByProductId(productId: string) {
    return await prisma.productUpsell.findFirst({
      where: { productId },
    });
  }

  static async list(filter: UpsellFilter, page: number, take: number) {
    const where: Prisma.ProductUpsellWhereInput = {};

    if (filter.enabled !== undefined) {
      where.enabled = filter.enabled;
    }

    if (filter.title !== undefined) {
      where.title = { contains: filter.title, mode: "insensitive" };
    }

    return await prisma.productUpsell.findMany({
      where,
      skip: (page - 1) * take,
      take,
    });
  }
}

export default UpsellDao;
