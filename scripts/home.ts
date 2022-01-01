// db에 있는 책 선택 시 저자와 출판사 칸 자동 입력
document.getElementById("book").addEventListener("input", function () {
    const book = {
        input: this as HTMLInputElement,
        options: Array.from(
            document.getElementById("books").getElementsByTagName("option")
        ),
        get selectedOpt(): HTMLOptionElement[] {
            return this.options.filter(
                (opt: HTMLOptionElement) => opt.label === this.input.value
            );
        },
    };
    const author = {
        listInput: document.getElementById("author") as HTMLInputElement,
        name: book.selectedOpt[0]?.dataset.author,
    };
    const publisher = {
        listInput: document.getElementById("publisher") as HTMLInputElement,
        name: book.selectedOpt[0]?.dataset.publisher,
    };
    if (book.selectedOpt.length > 0) {
        author.listInput.value = author.name;
        publisher.listInput.value = publisher.name;
    } else {
        author.listInput.value = "";
        publisher.listInput.value = "";
    }
});

// 저자 여러명 입력 시 쉼표 기준으로 완료된 저자 span으로 빼내기
(document.getElementById("author") as HTMLInputElement).addEventListener(
    "input",
    function () {
        const authArr = this.value.split(/,\s*/);
        const remainText = authArr.pop();
        if (authArr.length > 0) {
            authArr.forEach((author) => {
                if (author.length > 0 && !/\s+/.test(author)) {
                    this.insertAdjacentHTML(
                        "beforebegin",
                        `<span class="author-span">${author}</span>`
                    );
                    this.previousElementSibling.addEventListener(
                        "click",
                        function () {
                            this.remove();
                        }
                    );
                }
            });
            this.value = remainText;
        }
    }
);

// 제출 버튼 눌렀을 때 sumbit
document.getElementById("submit-memo").addEventListener("click", async (ev) => {
    ev.preventDefault();

    const content = {
        input: document.getElementsByName("content")[0] as HTMLTextAreaElement,
        get value(): string {
            return this.input.value;
        },
    };
    const book = {
        input: document.getElementById("book") as HTMLInputElement,
        options: Array.from(
            document.getElementById("books").getElementsByTagName("option")
        ),
        get selectedOpt(): HTMLOptionElement[] {
            return this.options.filter(
                (opt: HTMLOptionElement) =>
                    opt.label === this.input.value.trim() ||
                    (opt.dataset.title === this.input.value.trim() &&
                        opt.dataset.author === author.input.value.trim() &&
                        opt.dataset.publisher === publisher.input.value.trim())
            );
        },
        get value(): string {
            if (this.selectedOpt.length > 0) {
                return this.selectedOpt[0].dataset.value;
            } else {
                return this.input.value.trim();
            }
        },
    };
    const author = {
        input: document.getElementById("author") as HTMLInputElement,
        options: Array.from(
            document.getElementById("authors").getElementsByTagName("option")
        ),
        get value(): string {
            const authElemArr = Array.from(
                document.getElementsByClassName("author-ipt-wrapper")[0]
                    .children
            ).slice(1, -1) as Array<HTMLLIElement | HTMLInputElement>;
            const authArr = authElemArr.map(
                (elem) => elem.value || elem.textContent
            ) as string[];
            const authorIds = authArr
                .filter((author) => !/\s+/.test(author) && author.length > 0)
                .map((author) => {
                    const selectedOpt = this.options.filter(
                        (opt: HTMLOptionElement) => opt.label === author.trim()
                    );
                    if (selectedOpt.length > 0) {
                        return selectedOpt[0].dataset.value;
                    } else {
                        return author.trim();
                    }
                });
            return [...new Set(authorIds)].join(", ");
        },
    };
    const publisher = {
        input: document.getElementById("publisher") as HTMLInputElement,
        options: Array.from(
            document.getElementById("publishers").getElementsByTagName("option")
        ),
        get selectedOpt(): HTMLOptionElement[] {
            return this.options.filter(
                (opt: HTMLOptionElement) => opt.label === this.input.value
            );
        },
        get value(): string {
            if (this.selectedOpt.length > 0) {
                return this.selectedOpt[0].dataset.value;
            } else {
                return this.input.value.trim();
            }
        },
    };

    const form = new URLSearchParams({
        content: content.value,
        book: book.value,
        author: author.value,
        publisher: publisher.value,
    });
    await fetch("/create_process", {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        method: "POST",
        body: form,
    });
    location.reload();
});
