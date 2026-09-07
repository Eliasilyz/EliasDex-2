export const ADS_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false',

  nativeBanner: {
    containerId: 'container-d2c8954998da757ea389a9c99c9ba997',
    scriptSrc: 'https://pl31226332.profitableratecpmnetwork.com/d2c8954998da757ea389a9c99c9ba997/invoke.js',
    minHeight: 120,
  },

  banner300x250: {
    key: 'f9fcc70d924503cf719fe670fe0789e6',
    scriptSrc: 'https://www.highrevenueformat.com/f9fcc70d924503cf719fe670fe0789e6/invoke.js',
    width: 300,
    height: 250,
  },
} as const;
