import zod from "zod";

const signUpSchema = zod.object({
  firstname: zod.string(),
  lastname: zod.string(),
  username: zod.string(),
  password: zod.string(),
  email: zod.string().email(),
});

const logInSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

type SignUpSchemaetype = zod.infer<typeof signUpSchema>;

type LogInSchematype = zod.infer<typeof logInSchema>;

export { signUpSchema, SignUpSchemaetype, logInSchema, LogInSchematype };
