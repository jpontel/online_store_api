import express, { Application } from 'express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler';

import favoritosRoutes from './routes/favoritos.routes';
import dashboardRoutes from './routes/dashboard.routes';
import produtoRoutes from './routes/produtos.routes';
import contaRoutes from './routes/conta.routes';
import pedidosRotas from './routes/pedidos.routes';
import authRoutes from './routes/auth.routes';
import carrinhoRoutes from './routes/carrinho.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/pedidos', pedidosRotas);
app.use('/api/vendedor/dashboard', dashboardRoutes);
app.use('/api/vendedor', contaRoutes);

app.use(errorHandler);

export default app;
