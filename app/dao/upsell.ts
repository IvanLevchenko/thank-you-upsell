import prisma from "@/db.server";

class UpsellDao {
  static async getByProductId(productId: string) {
    return await prisma.productUpsell.findFirst({
      where: { productId },
    });
  }

  static async getByIdList(ids: string[]) {
    return await prisma.productUpsell.findMany({
      where: { productId: { in: ids } },
    });
  }
}

export default UpsellDao;
