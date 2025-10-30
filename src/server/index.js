import './load-env.js';
import app from './app.js';
import { refreshMaterializedViews } from './services/analytics.js';
import { query } from './database/db.js';

const port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await query(`SELECT 1`);

    try {
      await refreshMaterializedViews();
      console.log('Materialized views refreshed');
    } catch (error) {
      console.warn('Could not refresh materialized views on startup:', error.message);
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
