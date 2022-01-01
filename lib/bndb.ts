import { db } from "./db.ts";

export { db, bndb };

const bndb = { insertAuthor, insertPublisher, insertBook, insertMemo };

async function insertAuthor(authors: (string | number)[] | undefined) {
    if (authors) {
        return await Promise.all(
            authors?.map(async (author) => {
                if (typeof author === "string") {
                    const result = await db.execute(
                        "INSERT INTO author (name) VALUES (?)",
                        [author]
                    );
                    return result.lastInsertId;
                }
                return author;
            })
        );
    } else {
        throw new Error("No authors!");
    }
}
async function insertPublisher(publisher: string | number | null) {
    if (publisher && typeof publisher === "string") {
        const result = await db.execute(
            "INSERT INTO publisher (name) VALUES (?)",
            [publisher]
        );
        return result.lastInsertId;
    } else if (publisher) {
        return publisher as number;
    } else {
        throw new Error("No publisher!");
    }
}
async function insertBook(
    book: string | number | null,
    authorIds: (number | undefined)[],
    publisherId: number | undefined
) {
    if (book && typeof book === "string" && publisherId) {
        const result = await db.execute(
            "INSERT INTO book (publisher_id, title) VALUES (?, ?)",
            [publisherId, book]
        );
        await Promise.all(
            authorIds.map(async (authorId) => {
                if (authorId) {
                    return await db.execute(
                        "INSERT INTO book_author (book_id, author_id) VALUES (?, ?)",
                        [result.lastInsertId, authorId]
                    );
                } else {
                    throw new Error("Undefined author!");
                }
            })
        );
        return result.lastInsertId;
    } else if (book && typeof book === "number") {
        return book;
    } else if (publisherId) {
        throw new Error("Undefined book!");
    } else if (book) {
        throw new Error("Undefined publisher!");
    } else {
        throw new Error("Undefined book and publisher!");
    }
}
async function insertMemo(bookId: number | undefined, content: string | null) {
    if (bookId && content) {
        await db.execute(
            "INSERT INTO memo (book_id, content, created) VALUES (?, ?, NOW())",
            [bookId, content]
        );
    } else if (content) {
        throw new Error("Undefined book!");
    } else if (bookId) {
        throw new Error("Undefined content!");
    } else {
        throw new Error("Undefined book and content!");
    }
}
