module.exports = {
  apps : [{
    name: 'API',
    script: './bin/www',
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      DB_HOST: '127.0.0.1',
      DB_USERNAME: 'root',
      DB_PASSWORD: 'Unibosque2018',
      DB_NAME: 'registroAula'
    },
    env_production: {
      NODE_ENV: 'production',
      DB_HOST: '172.16.58.122',
      DB_USERNAME: 'aulas',
      DB_PASSWORD: 'Unibosque2018',
      DB_NAME: 'registroAula'
    }
  }],
};