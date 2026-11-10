import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PayersController } from './payers.controller';
import { PayersService } from './payers.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PayersController],
  providers: [PayersService],
  exports: [PayersService],
})
export class PayersModule {}
