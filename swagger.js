const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0', language: 'pt-BR' });

const doc = {
  info: {
    version: "1.0.0",
    title: "Operix API",
    description: "API do sistema de gestão inteligente para serviços técnicos e manutenções (Operix).",
    contact: {
      name: 'João Pedro P. Lima',
      url: 'https://joaopedrosh.github.io/website',
      email: 'devx.contato@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Desenvolvimento'
    },
    {
      url: 'Em breve',
      description: "Produção"
    }
  ],
  components: {
    securitySchemes:{
      bearerAuth: {
          type: 'http',
          scheme: 'bearer'
      }
    }
  }
};

const outputFile = './swagger-output.json';
const routes = ['./src/router.js'];

swaggerAutogen(outputFile, routes, doc).then(() => {
  require('./src/app.js');
});