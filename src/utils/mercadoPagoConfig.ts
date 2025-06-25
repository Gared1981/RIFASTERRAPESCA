// Configuración de Mercado Pago
export const MERCADO_PAGO_CONFIG = {
  // URLs de producción
  API_BASE_URL: 'https://api.mercadopago.com',
  CHECKOUT_URL: 'https://www.mercadopago.com.mx/checkout/v1/redirect',
  
  // Configuración de la aplicación
  STATEMENT_DESCRIPTOR: 'SORTEOS TERRAPESCA',
  
  // URLs de retorno (se configurarán dinámicamente)
  getReturnUrls: (baseUrl: string) => ({
    success: `${baseUrl}/payment/success`,
    failure: `${baseUrl}/payment/failure`,
    pending: `${baseUrl}/payment/pending`
  }),
  
  // Configuración de métodos de pago
  PAYMENT_METHODS: {
    excluded_payment_methods: [], // Puedes excluir métodos específicos aquí
    excluded_payment_types: [], // Puedes excluir tipos de pago aquí
    installments: 12, // Máximo de cuotas
    default_installments: 1
  },
  
  // Configuración de notificaciones
  getWebhookUrl: (baseUrl: string) => `${baseUrl}/api/webhooks/mercadopago`
};

// Función para validar configuración
export const validateMercadoPagoConfig = () => {
  const requiredEnvVars = [
    'MERCADO_PAGO_ACCESS_TOKEN',
    'MERCADO_PAGO_PUBLIC_KEY'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !Deno.env.get(envVar));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};