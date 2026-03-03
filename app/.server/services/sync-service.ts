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

  static async syncProducts(socket: Socket, storeName: string) {
    const session = await prisma.session.findFirst({
      where: {
        shop: storeName,
      },
    });

    if (!session) {
      console.error("Could not find session for store " + storeName);
      return;
    }

    let data: { data: { products: Connection<Product> } } | null = null;
    try {
      data = await graphql<{ products: Connection<Product> }>(
        session.shop,
        session.accessToken,
        products(),
      );
    } catch (e) {
      console.error("Error syncing products for store " + storeName, e);
    }

    if (!data) {
      console.error("No data returned from Shopify for store " + storeName);
      return;
    }

    let productsList = data.data.products.edges.map((edge) => edge.node);
    let hasNextPage = data.data.products.pageInfo.hasNextPage;

    try {
      await SyncService.createUpsells(productsList, session);
    } catch (e) {
      console.error("Error creating upsells for store " + storeName, e);
    }

    while (hasNextPage) {
      try {
        const nextData = await graphql<{ products: Connection<Product> }>(
          session.shop,
          session.accessToken,
          products(),
          { after: data.data.products.pageInfo.endCursor },
        );
        productsList = nextData.data.products.edges.map((edge) => edge.node);
        hasNextPage = nextData.data.products.pageInfo.hasNextPage;

        await SyncService.createUpsells(productsList, session);
      } catch (e) {
        console.error("Error syncing products for store " + storeName, e);
      }
    }

    socket.emit(SocketEvents.SYNC_PRODUCTS_COMPLETED);

    console.log("Sync completed for store " + storeName);
    console.log("Disconnecting socket for store " + storeName);
    socket.disconnect();
  }
}
