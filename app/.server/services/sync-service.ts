import { Session } from "@prisma/client";

import prisma from "../../db.server";
import { graphql } from "../../utils/graphql";
import { products } from "../../graphql/products/queries/products";
import { Product } from "../../types/product";
import { Connection } from "../../types/connection";
import { Socket } from "socket.io";
import { SocketEvents } from "../../enums/socket-events";

export class SyncService {
  private static async createUpsells(products: Product[], session: Session) {
    for (const product of products) {
      const upsell = await prisma.productUpsell.findFirst({
        where: {
          productId: product.id,
          store: session.shop,
        },
      });

      if (!upsell) {
        await prisma.productUpsell.create({
          data: {
            productId: product.id,
            title: product.title,
            image: product.media.edges[0]?.node?.preview?.image?.url,
            store: session.shop,
          },
        });
      }
    }
  }

  static async syncProducts(
    socket: Socket,
    storeName: string,
    onError: (error: string) => void,
  ) {
    const session = await prisma.session.findFirst({
      where: {
        shop: storeName,
      },
    });

    if (!session) {
      onError("Session not found");
      return;
    }

    const data = await graphql<{ products: Connection<Product> }>(
      session.shop,
      session.accessToken,
      products(),
    );
    let productsList = data.data.products.edges.map((edge) => edge.node);
    let hasNextPage = data.data.products.pageInfo.hasNextPage;

    await SyncService.createUpsells(productsList, session);

    while (hasNextPage) {
      const nextData = await graphql<{ products: Connection<Product> }>(
        session.shop,
        session.accessToken,
        products(),
        { after: data.data.products.pageInfo.endCursor },
      );
      productsList = nextData.data.products.edges.map((edge) => edge.node);
      hasNextPage = nextData.data.products.pageInfo.hasNextPage;

      await SyncService.createUpsells(productsList, session);
    }

    socket.emit(SocketEvents.SYNC_PRODUCTS_COMPLETED);
  }
}
