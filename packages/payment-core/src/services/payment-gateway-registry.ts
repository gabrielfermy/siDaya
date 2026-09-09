import { IPaymentGatewayProvider } from '../interfaces/payment-provider.interface';

export class PaymentGatewayRegistry {
  private readonly providers = new Map<string, IPaymentGatewayProvider>();

  register(provider: IPaymentGatewayProvider): void {
    this.providers.set(provider.providerId.toUpperCase(), provider);
  }

  get(providerId: string): IPaymentGatewayProvider {
    const provider = this.providers.get(providerId.toUpperCase());
    if (!provider) {
      throw new Error(`Payment gateway provider '${providerId}' is not registered in the payment core registry.`);
    }
    return provider;
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId.toUpperCase());
  }

  listRegistered(): string[] {
    return Array.from(this.providers.keys());
  }
}
