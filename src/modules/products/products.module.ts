import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { ProductCategoriesService } from "./product-categories.service";
import { ProductCategoriesController } from "./product-categories.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController, ProductCategoriesController],
  providers: [ProductsService, ProductCategoriesService],
  exports: [ProductsService, ProductCategoriesService],
})
export class ProductsModule {}