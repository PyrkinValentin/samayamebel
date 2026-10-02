ALTER TABLE `locations` RENAME COLUMN `main` TO `sort_order`;--> statement-breakpoint
ALTER TABLE `locations` MODIFY COLUMN `sort_order` int NOT NULL;--> statement-breakpoint
ALTER TABLE `locations` MODIFY COLUMN `sort_order` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_name_unique` UNIQUE(`name`);