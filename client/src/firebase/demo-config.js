const config = {};

// Copy contents to 'config.js' file in same directory and set placeholders with
// settings fetched from your Firebase online console.

// Firebase production environment configuration
config.prodConfig = {
  apiKey: "<API_KEY>,
  authDomain: "<AUTH_DOMAIN>",
  databaseURL: "<DATABASE_URL>",
  projectId: "<PROJECT_ID>",
  storageBucket: "<STORAGE_BUCKET>",
  messagingSenderId: "<MESSAGING_SENDER_ID>"
};

// Firebase development environment configuration
config.devConfig = {
  apiKey: "<API_KEY>,
  authDomain: "<AUTH_DOMAIN>",
  databaseURL: "<DATABASE_URL>",
  projectId: "<PROJECT_ID>",
  storageBucket: "<STORAGE_BUCKET>",
  messagingSenderId: "<MESSAGING_SENDER_ID>"
};

export default config;
