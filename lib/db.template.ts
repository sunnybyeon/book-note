import { Client } from "https://deno.land/x/mysql/mod.ts";

export const db = await new Client().connect({
    hostname: "",
    username: "",
    db: "",
    password: "",
});
