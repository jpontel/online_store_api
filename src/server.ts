import 'dotenv/config';
import app from './app';
import { conectarDatabase } from './config/database';

const PORT = process.env.PORT || 3001;
// const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Connect to database
    await conectarDatabase();

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Online Store API [Rodando na porta]: ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
