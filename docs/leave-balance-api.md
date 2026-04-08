{
  "message": "Account created successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInJvbGUiOiJFTVBMT1lFRSIsImlhdCI6MTc3NDQxOTk1NSwiZXhwIjoxNzc0NDIwODU1fQ.20yK5KDZwYwnDfaNULI_yG-56iEvZOwyPbeB5qKXb_g",
  "refresh_token": "e67f12ffadbc0313bfcfbcbafc5dede25a8bc8634bf4d2770d2b8bb2028234ce5a68dd0b06b62147",
  "expires_in": 900,
  "employee": {
    "id": 2,
    "name": "shikhar",
    "email": "shikhar@company.com",
    "role": "EMPLOYEE"
  }
}





Here are all 9 endpoints with their request bodies for testing. Start your server first with npm run dev:

🔐 Auth APIs
1. Signup — POST /api/v1/auth/signup
POST http://localhost:5001/api/v1/auth/signup
Content-Type: application/json
{
  "name": "Rahul Sharma",
  "email": "rahul@company.com",
  "password": "Test@1234",
  "role": "EMPLOYEE",
  "department": "Engineering"
}
2. Login — POST /api/v1/auth/login
POST http://localhost:5001/api/v1/auth/login
Content-Type: application/json
{
  "email": "rahul@company.com",
  "password": "Test@1234"
}
3. Refresh Token — POST /api/v1/auth/refresh
POST http://localhost:5001/api/v1/auth/refresh
Content-Type: application/json
{
  "refresh_token": "<REFRESH_TOKEN_FROM_SIGNUP_OR_LOGIN>"
}
4. Logout — POST /api/v1/auth/logout (Bearer token required)
POST http://localhost:5001/api/v1/auth/logout
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>
{
  "refresh_token": "<REFRESH_TOKEN>"
}
📊 Leave Balance API
5. Get Leave Balance — GET /api/v1/employees/{id}/leave-balance (Bearer token required)
GET http://localhost:5001/api/v1/employees/1/leave-balance?year=2026
Authorization: Bearer <ACCESS_TOKEN>
No body needed — employee_id is in the URL, year is a query param.

📝 Leave Application APIs
6. Apply for Leave — POST /api/v1/leaves/apply (Bearer token required)
POST http://localhost:5001/api/v1/leaves/apply
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>
{
  "start_date": "2026-04-07",
  "end_date": "2026-04-11",
  "leave_type": "CASUAL",
  "reason": "Family function"
}
7. View My Leaves — GET /api/v1/leaves/my (Bearer token required)
GET http://localhost:5001/api/v1/leaves/my?status=PENDING&year=2026&page=1&limit=10
Authorization: Bearer <ACCESS_TOKEN>
All query params are optional. Defaults: year=current, page=1, limit=10.

8. Get Single Leave — GET /api/v1/leaves/{leave_id} (Bearer token required)
GET http://localhost:5001/api/v1/leaves/1
Authorization: Bearer <ACCESS_TOKEN>
9. Cancel Leave — PATCH /api/v1/leaves/{leave_id}/cancel (Bearer token required)
PATCH http://localhost:5001/api/v1/leaves/1/cancel
Authorization: Bearer <ACCESS_TOKEN>
🛠️ Utility (for seeding data)
Seed Leave Policy
POST http://localhost:5001/api/v1/leave-policies
Content-Type: application/json
{
  "year": 2026,
  "totalLeave": 24
}
Reminder: You need a leave policy seeded for the year before testing leave balance or apply. The policy for 2026 was already seeded earlier — if you reset the DB, run this first.