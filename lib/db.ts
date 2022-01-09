import { Client } from "https://deno.land/x/mysql/mod.ts";

export const db = await new Client().connect({
    hostname: Deno.env.get("DB_HOST"),
    username: Deno.env.get("DB_USER"),
    db: Deno.env.get("DB_DB"),
    password: Deno.env.get("DB_PASS"),
});
