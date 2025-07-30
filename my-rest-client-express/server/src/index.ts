import express from 'express';
import cors from 'cors';
import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { History } from './entities/History';


const main = async () => {
  const orm = await MikroORM.init(config);
  const app = express();
  const PORT = process.env.PORT || 4000;

  app.use(cors()); 
  app.use(express.json());

  app.get('/api/history', async (req, res) => {
    try {
      const em = orm.em.fork();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [items, count] = await em.findAndCount(
        History,
        {},
        { orderBy: { createdAt: 'DESC' }, limit, offset }
      );

      return res.json({
        data: items,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error: any) {
      console.error('GET /api/history Error:', error);
      return res.status(500).json({ message: error.message });
    }
  });

  
  app.post('/api/history', async (req, res) => {
    try {
      const em = orm.em.fork();
      const newHistoryEntry = em.create(History, req.body);
      await em.persistAndFlush(newHistoryEntry);
      return res.status(201).json(newHistoryEntry);
    } catch (error: any) {
      console.error('POST /api/history Error:', error);
      return res.status(500).json({ message: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
};

main().catch(err => {
  console.error(err);
});