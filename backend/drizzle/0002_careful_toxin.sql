CREATE TABLE "employee_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"proficiency" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "proficiency_check" CHECK ("employee_skills"."proficiency" >= 1 AND "employee_skills"."proficiency" <= 5)
);
--> statement-breakpoint
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_employee_skills_employee_id" ON "employee_skills" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_employee_skills_unique" ON "employee_skills" USING btree ("employee_id","skill_name");--> statement-breakpoint
CREATE INDEX "idx_employee_skills_created_at" ON "employee_skills" USING btree ("created_at");