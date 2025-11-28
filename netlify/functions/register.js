import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";

export default async (req) => {
  try {
    const body = await req.json();
    const sql = neon();

    const { firstName, lastName, email, password } = body;

    // hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert record. neon generates id automatically if table uses uuid DEFAULT gen_random_uuid()
    const [user] = await sql`
      INSERT INTO users (first_name, last_name, email, password_hash, created_at)
      VALUES (
        ${firstName},
        ${lastName},
        ${email},
        ${passwordHash},
        NOW()
      )
      RETURNING id;
    `;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account created!",
        id: user.id
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
};
