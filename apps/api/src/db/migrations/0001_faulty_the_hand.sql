CREATE TABLE "admin_permission" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_permission_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "admin_role" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_role_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "admin_role_permission" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_role_permission_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
ALTER TABLE "admin_role_permission" ADD CONSTRAINT "admin_role_permission_role_id_admin_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_role_permission" ADD CONSTRAINT "admin_role_permission_permission_id_admin_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."admin_permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_permission_key_idx" ON "admin_permission" USING btree ("key");--> statement-breakpoint
CREATE INDEX "admin_role_slug_idx" ON "admin_role" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "admin_role_permission_role_id_idx" ON "admin_role_permission" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "admin_role_permission_permission_id_idx" ON "admin_role_permission" USING btree ("permission_id");