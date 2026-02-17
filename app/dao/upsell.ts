import prisma from "@/db.server";
import { UpsellFilter } from "@/types/upsell-filter";

class UpsellDao {
  static async getByProductId(productId: string) {
    return await prisma.productUpsell.findFirst({
      where: { productId },
    });
  }

  static async list(filter: UpsellFilter, page: number, take: number) {
    return await prisma.productUpsell.findMany({
      where: {
        ...(filter.enabled !== undefined ? { enabled: filter.enabled } : {}),
      },
      skip: (page - 1) * take,
      take,
    });
  }
}

export default UpsellDao;
