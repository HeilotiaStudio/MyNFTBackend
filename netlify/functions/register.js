import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export default async (req) => {
  try {
    const body = await req.json();
    const sql = neon();

    const { firstName, lastName, email, password } = body;

    const passwordHash = await bcrypt.hash(password, 10);
    const walletHash = crypto.createHash("sha256")
                         .update(email + Date.now())
                         .digest("hex");

    const [user] = await sql`
      INSERT INTO users (first_name, last_name, email, password_hash, wallet_hash, created_at)
      VALUES (
        ${firstName},
        ${lastName},
        ${email},
        ${passwordHash},
        ${walletHash},
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

