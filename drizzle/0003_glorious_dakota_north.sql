ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndDate` timestamp;