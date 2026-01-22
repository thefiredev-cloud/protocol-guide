ALTER TABLE `protocolChunks` ADD `protocolEffectiveDate` varchar(20);--> statement-breakpoint
ALTER TABLE `protocolChunks` ADD `lastVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `protocolChunks` ADD `protocolYear` int;