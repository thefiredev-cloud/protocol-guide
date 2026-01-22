CREATE TABLE `counties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`state` varchar(2) NOT NULL,
	`usesStateProtocols` boolean NOT NULL DEFAULT false,
	`protocolVersion` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `counties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocolChunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countyId` int NOT NULL,
	`protocolNumber` varchar(50) NOT NULL,
	`protocolTitle` varchar(255) NOT NULL,
	`section` varchar(255),
	`content` text NOT NULL,
	`sourcePdfUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `protocolChunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`countyId` int NOT NULL,
	`queryText` text NOT NULL,
	`responseText` text,
	`protocolRefs` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `tier` enum('free','pro','enterprise') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `queryCountToday` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastQueryDate` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `selectedCountyId` int;