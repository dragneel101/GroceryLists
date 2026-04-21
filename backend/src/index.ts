import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import itemsRoutes from './routes/items';
import listsRoutes from './routes/lists';
import listItemsRoutes from './routes/listItems';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/lists', listItemsRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on :${PORT}`);
});
