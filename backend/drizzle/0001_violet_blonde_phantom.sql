ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_employee_id_employees_id_fk" FOREIGN KEY ("target_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_employees_manager_id" ON "employees" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "idx_employees_department" ON "employees" USING btree ("department");--> statement-breakpoint
CREATE INDEX "idx_employees_is_active" ON "employees" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_leave_records_status" ON "leave_records" USING btree ("leave_status");--> statement-breakpoint
ALTER TABLE "leave_policy" ADD CONSTRAINT "chk_total_leave_non_negative" CHECK ("leave_policy"."total_leave" >= 0);