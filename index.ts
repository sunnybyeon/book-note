import { serve } from "https://deno.land/std/http/mod.ts";
import {
    readAll,
    readerFromStreamReader,
    readableStreamFromReader,
} from "https://deno.land/std/streams/mod.ts";
import { extname } from "https://deno.land/std/path/mod.ts";

await import("https://deno.land/x/dotenv/load.ts");

import * as template from "./lib/template.ts";
const { db, bndb } = await import("./lib/bndb.ts");

const decoder = new TextDecoder();

serve(
    async (req) => {
        const reqUrl = new URL(req.url);
        const reqBody = req.body?.getReader();
        const post = reqBody
            ? new URLSearchParams(
                  decoder.decode(await readAll(readerFromStreamReader(reqBody)))
              )
            : new URLSearchParams();
        if (reqUrl.pathname === "/") {
            const [books, authors, publishers] = await Promise.all([
                db.execute(
                    `SELECT
                        b.id, b.title, p.name AS publisher, GROUP_CONCAT(a.name SEPARATOR ', ') AS author
                        FROM book AS b
                            LEFT JOIN publisher AS p
                                ON b.publisher_id = p.id
                            LEFT JOIN book_author AS ba
                                ON b.id = ba.book_id
                            LEFT JOIN author AS a
                                ON ba.author_id = a.id
                        GROUP BY b.id`
                ),
                db.execute("SELECT * FROM author"),
                db.execute("SELECT * FROM publisher"),
            ]);
            return new Response(
                template.layouts.html(
                    "Book Note",
                    template.bodies.home(books, authors, publishers),
                    {
                        css: ["/styles/home.css"],
                        js: ["/scripts/build/home.js"],
                    }
                ),
                { headers: { "content-type": "text/html" }, status: 200 }
            );
        } else if (reqUrl.pathname === "/create_process") {
            const content = post.get("content");
            const book = Number(post.get("book")) || post.get("book");
            const authors = post
                .get("author")
                ?.split(/,\s*/)
                .map((author) => Number(author) || author);
            const publisher =
                Number(post.get("publisher")) || post.get("publisher");

            const [authorIds, publisherId] = await Promise.all([
                bndb.insertAuthor(authors),
                bndb.insertPublisher(publisher),
            ]);
            const bookId = await bndb.insertBook(book, authorIds, publisherId);
            await bndb.insertMemo(bookId, content);
            return new Response();
        } else if (/^\/(styles|scripts|images)\/.+$/.test(reqUrl.pathname)) {
            try {
                const filePath = await Deno.realPath(
                    reqUrl.pathname.substring(1)
                );
                const file = await Deno.open(filePath);
                const stat = await file.stat();
                if (stat.isDirectory) {
                    file.close();
                    throw new Error("path leads to directory");
                }
                const fileSream = readableStreamFromReader(file);
                const fileExt = extname(filePath);
                const mimeTypes: { [index: string]: string } = {
                    ".js": "text/javascript",
                    ".css": "text/css",
                    ".png": "image/png",
                    ".jpg": "image/jpg",
                    ".gif": "image/gif",
                    ".svg": "image/svg+xml",
                };
                const contentType =
                    mimeTypes[fileExt] || "application/octet-stream";
                return new Response(fileSream, {
                    headers: { "content-type": contentType },
                    status: 200,
                });
            } catch (_err) {
                return new Response(
                    template.layouts.html(
                        "Error",
                        `<h1>404 Not Found</h1><a href="/">Go Home</a>`
                    ),
                    { headers: { "content-type": "text/html" }, status: 404 }
                );
            }
        } else {
            return new Response(
                template.layouts.html(
                    "Error",
                    `<h1>404 Not Found</h1><a href="/">Go Home</a>`
                ),
                { headers: { "content-type": "text/html" }, status: 404 }
            );
        }
    },
    { addr: ":8000" }
);
