import 'dotenv/config';
import app from './app';
import { conectarDatabase } from './config/database';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    
    await conectarDatabase();

    app.listen(PORT, () => {
      console.log(`Online Store API [Rodando na porta]: ${PORT}`);
    });

  } catch (error) {
    console.error('Online Store API [Falha ao iniciar]: ', error);
    process.exit(1);
  }
};

startServer();
