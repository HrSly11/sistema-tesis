import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeProvider } from './providers/stripe.provider';
import { CulqiProvider } from './providers/culqi.provider';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeProvider, CulqiProvider, MercadoPagoProvider],
  exports: [PaymentsService, CulqiProvider, StripeProvider, MercadoPagoProvider],
})
export class PaymentsModule {}
