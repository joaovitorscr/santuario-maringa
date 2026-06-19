CREATE TYPE "public"."adoption_status" AS ENUM('Adopted', 'Adoption Process', 'Available', 'Not Available');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('Male', 'Female');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoption_candidates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cellphone" varchar(15) NOT NULL,
	"cpf" varchar(14),
	"address" varchar(255),
	"observation" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"adoption_candidate_id" uuid NOT NULL,
	"cat_id" uuid NOT NULL,
	"adoption_date" timestamp NOT NULL,
	"observation" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cat" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"adoption_term_base64" text,
	"adoption_term_mime_type" text,
	"medical_exam_base64" text,
	"medical_exam_mime_type" text,
	"fur_type_id" uuid,
	"adoption_status" "adoption_status" DEFAULT 'Not Available' NOT NULL,
	"entry_date" timestamp NOT NULL,
	"adoption_date" timestamp,
	"birth_date" timestamp,
	"race" text NOT NULL,
	"gender" "gender" NOT NULL,
	"is_castrated" boolean DEFAULT false NOT NULL,
	"is_vaccinated" boolean DEFAULT false NOT NULL,
	"weight_kg" numeric(5, 2),
	"is_fiv" boolean DEFAULT false,
	"is_felv" boolean DEFAULT false,
	"observation" varchar(500),
	"user_name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fur_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "fur_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"display_username" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'volunteer',
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_adoption_candidate_id_adoption_candidates_id_fk" FOREIGN KEY ("adoption_candidate_id") REFERENCES "public"."adoption_candidates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_cat_id_cat_id_fk" FOREIGN KEY ("cat_id") REFERENCES "public"."cat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cat" ADD CONSTRAINT "cat_fur_type_id_fur_type_id_fk" FOREIGN KEY ("fur_type_id") REFERENCES "public"."fur_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cat" ADD CONSTRAINT "cat_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "adoption_candidates_name_idx" ON "adoption_candidates" USING btree ("name");--> statement-breakpoint
CREATE INDEX "adoption_candidates_cellphone_idx" ON "adoption_candidates" USING btree ("cellphone");--> statement-breakpoint
CREATE INDEX "adoptions_adoption_candidate_id_idx" ON "adoptions" USING btree ("adoption_candidate_id");--> statement-breakpoint
CREATE INDEX "adoptions_cat_id_idx" ON "adoptions" USING btree ("cat_id");--> statement-breakpoint
CREATE INDEX "cat_created_by_user_id_idx" ON "cat" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cat_fur_type_id_idx" ON "cat" USING btree ("fur_type_id");--> statement-breakpoint
CREATE INDEX "fur_type_name_idx" ON "fur_type" USING btree ("name");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");