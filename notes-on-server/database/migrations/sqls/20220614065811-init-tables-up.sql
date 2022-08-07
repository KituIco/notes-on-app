CREATE TABLE `users` (
    `userId` VARCHAR(15) NOT NULL,
    `userName` VARCHAR(31) NOT NULL,
    `firstName` VARCHAR(31) NOT NULL,
    `lastName` VARCHAR(31) NOT NULL,
    `email` VARCHAR(63) NOT NULL,
    `password` VARCHAR(127) NOT NULL,
    `totalWorkspaces` INT DEFAULT 0,
    `icon` VARCHAR(255) DEFAULT '',
    PRIMARY KEY (`userId`),
    CONSTRAINT `unique_email` UNIQUE (`email`)
);

CREATE TABLE `workspaces` (
    `workspaceId` VARCHAR(15) NOT NULL,
    `userId` VARCHAR(15) NOT NULL,
    `title` VARCHAR(63) DEFAULT "New Workspace",
    `description` VARCHAR(255),
    `creationDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `totalPages` INT DEFAULT 0,
    `order` INT NOT NULL,
    `icon` VARCHAR(255) DEFAULT '',
    `cover` VARCHAR(255) DEFAULT '',
    PRIMARY KEY (`workspaceId`),
    FOREIGN KEY (`userId`) REFERENCES users(`userId`),
    CONSTRAINT `uq_order` UNIQUE (`order`,`userId`)
);

CREATE TABLE `pages` (
    `pageId` VARCHAR(15) NOT NULL,
    `workspaceId` VARCHAR(15) NOT NULL,
    `title` VARCHAR(63) NOT NULL,
    `totalBlocks` INT DEFAULT 0,
    `order` INT NOT NULL,
    `locked` BOOLEAN DEFAULT 0,
    `banner` BOOLEAN DEFAULT 0,
    `shared` BOOLEAN DEFAULT 0,
    `icon` VARCHAR(255) DEFAULT '',
    `cover` VARCHAR(255) DEFAULT '',
    PRIMARY KEY (`pageId`),
    FOREIGN KEY (`workspaceId`) REFERENCES workspaces(`workspaceId`),
    CONSTRAINT `uq_order` UNIQUE (`order`,`workspaceId`)
);

CREATE TABLE `blocks` (
    `blockId` VARCHAR(15) NOT NULL,
    `pageId` VARCHAR(15) NOT NULL,
    `type` VARCHAR(31) NOT NULL,
    `size` VARCHAR(31) NOT NULL DEFAULT "full",
    `content` VARCHAR(4095) DEFAULT "",
    `order` INT NOT NULL,
    PRIMARY KEY (`blockId`),
    FOREIGN KEY (`pageId`) REFERENCES pages(`pageId`),
    CONSTRAINT `uq_order` UNIQUE (`order`,`pageId`)
);

/* User Repository Queries */

CREATE PROCEDURE `selectUsers`(
    IN `offset` int,
    IN `numlimit` int
)
BEGIN
    SELECT `userId`, `userName`, `email`
    FROM users ORDER BY `userName`
    LIMIT `offset`, `numlimit`;
END;

CREATE PROCEDURE `insertUser`(
	IN `id` varchar(15),
    IN `username` varchar(31),
    IN `firstname` varchar(31),
    IN `lastname` varchar(31),
    IN `mail` varchar(63),
    IN `pass` varchar(127)
)
BEGIN
	INSERT INTO users(`userId`, `userName`, `firstName`, `lastName`, `email`, `password`) 
    VALUES (`id`, `username`, `firstname`, `lastname`, `mail`, `pass`);
END;

CREATE PROCEDURE `selectUser` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `userId`, `userName`, `firstName`, `lastName`, `email`, `totalWorkspaces`, `icon`
    FROM users 
    WHERE `userId` = `id`;
END;

CREATE PROCEDURE `selectUserEdit` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `userName`, `firstName`, `lastName`,`password`, `icon`
    FROM users 
    WHERE `userId` = `id`;
END;

CREATE PROCEDURE `updateUser` (
    IN `username` varchar(31),
    IN `firstname` varchar(31),
    IN `lastname` varchar(31),
    IN `pass` varchar(127),
    IN `newicon` VARCHAR(255),
    IN `id` varchar(15)
)
BEGIN
	UPDATE users 
    SET `userName` = `username`, `firstName` = `firstname`, `lastName` = `lastname`, `password` = `pass`, `icon` = `newicon`
	WHERE `userId` = `id`;
END;

CREATE PROCEDURE `selectUserMail` (
    IN `mail` varchar(63)
)
BEGIN
	SELECT *
    FROM users 
    WHERE `email` = `mail`;
END;

CREATE PROCEDURE `selectUserTotalSpaces` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `totalWorkspaces`
    FROM users 
    WHERE `userId` = `id`;
END;

CREATE PROCEDURE `updateUserTotalSpaces` (
    IN `num` int,
    IN `id` varchar(15)
)
BEGIN
	UPDATE users SET `totalWorkspaces` = `num` 
    WHERE `userId` = `id`;
END;

CREATE PROCEDURE `selectWorkspaceOrder` (
    IN `uid` varchar(15),
    IN `wsid` varchar(15)
)
BEGIN
	SELECT userId, workspaceId, `order`
    FROM workspaces
    WHERE `userId` = `uid` AND `workspaceId` = `wsid`;
END;

CREATE PROCEDURE `updateWorkspaceOrder` (
    IN `id` varchar(15),
    IN `oldorder` int,
    IN `neworder` int
)
BEGIN
	UPDATE workspaces SET `order` = `neworder` 
    WHERE `order` = `oldorder` AND `userId` = `id`;
END;

/* Workspace Repository Queries*/

CREATE PROCEDURE `selectWorkspaces`(
    IN `offset` int,
    IN `numlimit` int
)
BEGIN
	SELECT 
        workspaces.title, 
        workspaces.workspaceId, 
        users.userName, 
        workspaces.userId, 
        workspaces.creationDate
    FROM workspaces
    INNER JOIN users
    ON workspaces.userId = users.userId
    ORDER BY workspaces.creationDate DESC
    LIMIT `offset`, `numlimit`;
END;

CREATE PROCEDURE `insertWorkspace`(
	IN `id` varchar(15),
    IN `userid` varchar(15),
    IN `newtitle` varchar(63),
    IN `newdescription` varchar(255),
    IN `pos` int
)
BEGIN
	INSERT INTO workspaces(`workspaceId`, `userId`, `title`, `description`, `order`) 
    VALUES (`id`, `userid`, `newtitle`, `newdescription`, `pos`);
END;

CREATE PROCEDURE `selectUserSpaces`(
    IN `offset` int,
    IN `numlimit` int,
    IN `id` varchar(15)
)
BEGIN
	SELECT 
        workspaces.order, 
        workspaces.title, 
        workspaces.workspaceId, 
        users.userName, 
        workspaces.userId, 
        workspaces.creationDate,
        workspaces.icon,
        workspaces.cover,
        workspaces.description
    FROM workspaces
    INNER JOIN users
    ON workspaces.userId = users.userId
    WHERE workspaces.userId = id
    ORDER BY workspaces.order
    LIMIT `offset`, `numlimit`;
END;

CREATE PROCEDURE `selectWorkspace` (
    IN `id` varchar(15)
)
BEGIN
	SELECT 
        workspaces.title, 
        workspaces.workspaceId, 
        users.userName,
        users.totalWorkspaces, 
        workspaces.userId,
        workspaces.description,  
        workspaces.creationDate, 
        workspaces.totalPages,
        workspaces.order,
        workspaces.cover,
        workspaces.icon
    FROM workspaces
    INNER JOIN users
    ON workspaces.userId = users.userId
    WHERE `workspaceId` = `id`;
END;

CREATE PROCEDURE `selectWorkspaceEdit` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `userId`, `title`, `description`, `cover`, `icon`
    FROM workspaces
    WHERE `workspaceId` = `id`;
END;

CREATE PROCEDURE `updateWorkspace` (
    IN `userid` varchar(15),
    IN `newtitle` varchar(63),
    IN `newdescription` varchar(255),
    IN `newcover` varchar(255),
    IN `newicon` varchar(255),
    IN `id` varchar(15)
)
BEGIN
	UPDATE workspaces 
    SET `userId` = `userid`, 
        `title` = `newtitle`, 
        `description` = `newdescription`,
        `cover` = `newcover`,
        `icon` = `newicon`
	WHERE `workspaceId` = `id`;
END;

CREATE PROCEDURE `selectSpaceTotalPages` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `totalPages`
    FROM workspaces 
    WHERE `workspaceId` = `id`;
END;

CREATE PROCEDURE `updateSpaceTotalPages` (
    IN `num` int,
    IN `id` varchar(15)
)
BEGIN
	UPDATE workspaces SET `totalPages` = `num` 
    WHERE `workspaceId` = `id`;
END;

CREATE PROCEDURE `selectPageOrder` (
    IN `wsid` varchar(15),
    IN `pid` varchar(15)
)
BEGIN
	SELECT workspaceId, pageId, `order`
    FROM pages
    WHERE `workspaceId` = `wsid` AND `pageId` = `pid`;
END;

CREATE PROCEDURE `updatePageOrder` (
    IN `id` varchar(15),
    IN `oldorder` int,
    IN `neworder` int
)
BEGIN
	UPDATE pages SET `order` = `neworder` 
    WHERE `order` = `oldorder` AND `workspaceId` = `id`;
END;

CREATE PROCEDURE `deleteWorkspace` (
    IN `id` varchar(15)
)
BEGIN
	DELETE FROM workspaces
    WHERE `workspaceId` = `id`;
END;

/* Page Repository Queries */

CREATE PROCEDURE `selectPages`(
    IN `offset` int,
    IN `numlimit` int,
    IN `id` varchar(15)
)
BEGIN
	SELECT *
    FROM pages
    WHERE pages.workspaceId = id
    ORDER BY pages.order
    LIMIT `offset`, `numlimit`;
END;

CREATE PROCEDURE `selectPagesBlocks`(
    IN `offset` int,
    IN `numlimit` int,
    IN `id` varchar(15)
)
BEGIN
	SELECT pages.pageId, blocks.content, blocks.blockId, pages.title, pages.icon
    FROM pages
    INNER JOIN blocks
    ON pages.pageId = blocks.pageId
    WHERE pages.workspaceId = id
    ORDER BY pages.`order`, blocks.`order`
    LIMIT `offset`, `numlimit`;
END;

CREATE PROCEDURE `insertPage`(
	IN `id` varchar(15),
    IN `workspaceid` varchar(15),
    IN `newtitle` varchar(63),
    IN `pos` int
)
BEGIN
	INSERT INTO pages(`pageId`, `workspaceId`, `title`, `order`) 
    VALUES (`id`, `workspaceid`, `newtitle`, `pos`);
END;

CREATE PROCEDURE `selectPage` (
    IN `id` varchar(15),
    IN `workspaceid` varchar(15)
)
BEGIN
	SELECT *
    FROM pages
    WHERE pages.pageId = id AND pages.workspaceId = workspaceid;
END;

CREATE PROCEDURE `selectPublicPage` (
    IN `id` varchar(15)
)
BEGIN
	SELECT *
    FROM pages
    WHERE pages.pageId = id;
END;

CREATE PROCEDURE `selectPageEdit` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `workspaceId`, `title`, `locked`, `banner`, `shared`, `cover`, `icon`
    FROM pages
    WHERE `pageId` = `id`;
END;

CREATE PROCEDURE `updatePage` (
    IN `workspaceid` varchar(15),
    IN `newtitle` varchar(63),
    IN `newlock` BOOLEAN,
    IN `newbanner` BOOLEAN,
    IN `newshared` BOOLEAN,
    IN `newcover` varchar(255),
    IN `newicon` varchar(255),
    IN `id` varchar(15)
)
BEGIN
	UPDATE pages
    SET `workspaceId` = `workspaceid`, 
        `title` = `newtitle`, 
        `locked` = `newlock`,
        `banner` = `newbanner`,
        `shared` = `newshared`,
        `cover` = `newcover`,
        `icon` = `newicon`
	WHERE `pageId` = `id`;
END;

CREATE PROCEDURE `selectPageTotalBlocks` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `totalBlocks`
    FROM pages 
    WHERE `pageId` = `id`;
END;

CREATE PROCEDURE `updatePageTotalBlocks` (
    IN `num` int,
    IN `id` varchar(15)
)
BEGIN
	UPDATE pages SET `totalBlocks` = `num` 
    WHERE `pageId` = `id`;
END;

-- remove
CREATE PROCEDURE `selectBlockOrder` ( 
    IN `pid` varchar(15),
    IN `bid` varchar(15)
)
BEGIN
	SELECT pageId, blockId, `order`
    FROM blocks
    WHERE `pageId` = `pid` AND `blockId` = `bid`;
END;

CREATE PROCEDURE `updateBlockOrder` (
    IN `id` varchar(15),
    IN `oldorder` int,
    IN `neworder` int
)
BEGIN
	UPDATE blocks SET `order` = `neworder` 
    WHERE `order` = `oldorder` AND `pageId` = `id`;
END;

CREATE PROCEDURE `deletePage` (
    IN `id` varchar(15)
)
BEGIN
	DELETE FROM pages
    WHERE `pageId` = `id`;
END;

/* Block Repository Queries */

CREATE PROCEDURE `selectBlocks`(
    IN `offset` int,
    IN `numlimit` int,
    IN `id` varchar(15)
)
BEGIN
	SELECT *
    FROM blocks
    WHERE blocks.pageId = id
    ORDER BY blocks.order
    LIMIT `offset`, `numlimit`;
END;

CREATE PROCEDURE `insertBlock`(
	IN `id` varchar(15),
    IN `pageid` varchar(15),
    IN `newtype` varchar(31),
    IN `pos` int
)
BEGIN
	INSERT INTO blocks(`blockId`, `pageId`, `type`, `order`) 
    VALUES (`id`, `pageid`, `newtype`, `pos`);
END;

CREATE PROCEDURE `selectBlock` (
    IN `id` varchar(15),
    IN `pageid` varchar(15)
)
BEGIN
	SELECT 
        blocks.type,
        blocks.`size`, 
        blocks.blockId, 
        pages.title AS `page`, 
        pages.pageId,
        blocks.content,
        blocks.`order`
    FROM blocks
    INNER JOIN pages
    ON blocks.pageId = pages.pageId
    WHERE blocks.blockId = id AND blocks.pageId = pageid;
END;

CREATE PROCEDURE `selectBlockEdit` (
    IN `id` varchar(15)
)
BEGIN
	SELECT `type`, `content`, `size`, `pageId`
    FROM blocks
    WHERE `blockId` = `id`;
END;

CREATE PROCEDURE `updateBlock` (
    IN `newtype` varchar(31),
    IN `newcontent` varchar(4095),
    IN `newsize` varchar(31),
    IN `id` varchar(15)
)
BEGIN
	UPDATE blocks
    SET `type` = `newtype`, `content` = `newcontent`, `size`=`newsize`
	WHERE `blockId` = `id`;
END;

CREATE PROCEDURE `deleteBlock` (
    IN `id` varchar(15)
)
BEGIN
	DELETE FROM blocks
    WHERE `blockId` = `id`;
END;

CREATE PROCEDURE `selectSpaceBlocks`(
    IN `offset` int,
    IN `numlimit` int,
    IN `id` varchar(15)
)
BEGIN
	SELECT 
        blocks.blockId, 
        pages.pageId,
        workspaces.workspaceId
    FROM blocks
    INNER JOIN pages
    ON blocks.pageId = pages.pageId
    INNER JOIN workspaces
    ON pages.workspaceId = workspaces.workspaceId
    WHERE workspaces.workspaceId = id
    LIMIT `offset`, `numlimit`;
END;
