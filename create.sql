CREATE TABLE `memo` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `book_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `created` DATE NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `book` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `publisher_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `author` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `book_author` (
    `book_id` INT NOT NULL,
    `author_id` INT NOT NULL,
    PRIMARY KEY (`book_id`, `author_id`)
);

CREATE TABLE `publisher` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
);
