declare module "@paypal/checkout-server-sdk" {
  export namespace core {
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class PayPalHttpClient {
      constructor(environment: LiveEnvironment | SandboxEnvironment);
      execute(request: orders.OrdersCreateRequest): Promise<{
        result: {
          links: Array<{ rel: string; href: string }>;
        };
      }>;
    }
  }

  export namespace orders {
    class OrdersCreateRequest {
      prefer(preference: string): void;
      requestBody(body: unknown): void;
    }
  }
}
