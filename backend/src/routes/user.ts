import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZTljMTE1LTdmNDMtNGY5OS04YmExLTAyZjNjOTJmOTk3MSJ9.oLeaN0oZWIN0G0D4OXIyNycN9CauQP-qOR6s2Zkkuy8
userRouter.post("/signup", async (c) => {
	const body = await c.req.json();
	// const { success } = signupInput.safeParse(body);
	// if(!success){
	// 	c.status(411);
	// 	return c.json({
	// 		message: "Inputs not good"
	// 	})
	// }
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const user = await prisma.user.create({
			data: {
				name: body.username,
				password: body.password,
				email: body.email,
			},
		});
		const token = await sign({ id: user.id }, c.env.JWT_SECRET)
  
		return c.json({
		  jwt: token
		})
	} catch (e) {
		console.log(e);
		console.log("control reached error");
		c.status(411);
		return c.text("Invalid");
	}
});

userRouter.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})


