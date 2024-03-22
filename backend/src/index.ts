import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { decode, sign, verify } from 'hono/jwt'
import { bookRouter } from "./routes/blog";
import { userRouter } from "./routes/user";


const app = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

app.route('/api/v1/blog', bookRouter);
app.route('/api/v1', userRouter);
export default app;
