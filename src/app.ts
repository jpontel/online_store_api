import express, { Application } from 'express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler';

import favoritesRoutes from './routes/favorites.routes';
import dashboardRoutes from './routes/dashboard.routes';
import productRoutes from './routes/products.routes';
import accountRoutes from './routes/account.routes';
import ordersRoutes from './routes/orders.routes';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carrinho', cartRoutes);
app.use('/api/favoritos', favoritesRoutes);
app.use('/api/pedidos', ordersRoutes);
app.use('/api/vendedor/dashboard', dashboardRoutes);
app.use('/api/vendedor', accountRoutes);

app.use(errorHandler);

export default app;
