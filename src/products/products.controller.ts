import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      return this.client.send('create_product', createProductDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  findAllProducts(@Query() PaginationDto: PaginationDto): any {
    return this.client.send('find_all_products', PaginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const product = await firstValueFrom(
        this.client.send('find_one_product', { id }),
      );

      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      return this.client.send('update_product', { id, ...updateProductDto });
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  removeProduct(@Param('id') id: number) {
    try {
      return this.client.send('remove_product', { id });
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
