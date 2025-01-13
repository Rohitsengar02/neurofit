const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'neurofit',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

