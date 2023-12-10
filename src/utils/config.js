import { config } from 'dotenv';

config();
const page_limit = process.env.LIMIT || 10;

export { page_limit };