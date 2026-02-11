import prisma from "@/db.server";

class UpsellDao {
  static async getByProductId(productId: string) {
    return await prisma.productUpsell.findFirst({
      where: { productId },
    });
  }
}

export default UpsellDao;
