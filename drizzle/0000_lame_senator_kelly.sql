CREATE TABLE `locations` (
	`id` varchar(36) NOT NULL,
	`value` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone_number` varchar(19) NOT NULL,
	`main` boolean NOT NULL DEFAULT false,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_value_unique` UNIQUE(`value`)
);
