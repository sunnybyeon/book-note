import type { ExecuteResult } from "https://deno.land/x/mysql/mod.ts";

export const layouts = {
    html: (
        title: string,
        body: string,
        files: { css: string[]; js: string[] } = { css: [], js: [] }
    ): string => {
        const cssLink = files.css
            .map((link) => `<link rel="stylesheet" href="${link}">`)
            .join("");
        const jsScript = files.js
            .map((link) => `<script defer src="${link}"></script>`)
            .join("");
        return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="/styles/main.css">
                    ${cssLink}
                    ${jsScript}
                    <title>${title}</title>
                </head>
                <body>
                    ${body}
                </body>
            </html>`;
    },
};

export const bodies = {
    home: (
        books: ExecuteResult,
        authors: ExecuteResult,
        publishers: ExecuteResult
    ): string => {
        const options = components.homeOptions(books, authors, publishers);
        return `<form action="/create_process" method="POST">
            <textarea name="content" placeholder="메모"></textarea>
            <div class="book-ipt-wrapper">
                <label for="book">책: </label>
                <input list="books" id="book" placeholder="책 제목">
                <datalist id="books">
                    ${options.book}
                </datalist>
            </div>
            <div class="three-ipts-wrapper">
                <div class="author-ipt-wrapper">
                    <label for="author">저자: </label>
                    <input list="authors" id="author" placeholder="저자 이름">
                    <datalist id="authors">
                        ${options.author}
                    </datalist>
                </div>

                <div class="two-ipts-wrapper">
                    <label for="publisher">출판사: </label>
                    <input list="publishers" id="publisher" placeholder="출판사 이름">
                    <datalist id="publishers">
                        ${options.publisher}
                    </datalist>

                    <input type="submit" id="submit-memo">
                </div>
            </div>
        </form>`;
    },
};

export const components = {
    homeOptions: (
        books: ExecuteResult,
        authors: ExecuteResult,
        publishers: ExecuteResult
    ): {
        book: string | undefined;
        author: string | undefined;
        publisher: string | undefined;
    } => {
        const book = books.rows
            ?.map(
                (row: {
                    id: number;
                    title: string;
                    publisher: string;
                    author: string;
                }) =>
                    `<option
                        data-value="${row.id}"
                        data-title="${row.title}"
                        data-author="${row.author}"
                        data-publisher="${row.publisher}"
                    >${row.title} - ${row.author} 지음 - ${row.publisher} 펴냄</option>`
            )
            .join("\n");
        const author = authors.rows
            ?.map(
                (row: { id: number; name: string }) =>
                    `<option data-value="${row.id}">${row.name}</option>`
            )
            .join("\n");
        const publisher = publishers.rows
            ?.map(
                (row: { id: number; name: string }) =>
                    `<option data-value="${row.id}">${row.name}</option>`
            )
            .join("\n");
        return { book, author, publisher };
    },
};
