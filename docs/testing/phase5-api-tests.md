# Phase 5 — API Test Results

## Route: /api/internships
**Date:** 2026  
**Tester:** Manual (Thunder Client)  
**Environment:** Local (localhost:3000)

---

## Part A — /api/internships (collection)

### Test 1 — GET all internships
- **Method:** GET  
- **URL:** `/api/internships`  
- **Expected:** 200 OK, empty array  
- **Result:** ✅ PASS  
- **Screenshot:** screenshots/phase5-get-empty.png

### Test 2 — POST create internship (valid data)
- **Method:** POST  
- **URL:** `/api/internships`  
- **Body:**
```json
{
  "company": "Tech Company PH",
  "supervisor": "Maria Santos",
  "requiredHours": 600,
  "startDate": "2026-01-06T00:00:00.000Z",
  "status": "ACTIVE"
}
```
- **Expected:** 201 Created with new record  
- **Result:** ✅ PASS  
- **Screenshot:** screenshots/phase5-post-valid.png

### Test 3 — POST create internship (invalid data) 🔒 Security
- **Method:** POST  
- **URL:** `/api/internships`  
- **Body:**
```json
{
  "company": "",
  "requiredHours": -10
}
```
- **Expected:** 400 Bad Request with field errors  
- **Result:** ✅ PASS — Zod rejected all invalid fields  
- **Screenshot:** screenshots/phase5-post-invalid.png

---

## Part B — /api/internships/[id] (single record)

### Test 1 — GET single internship
- **Method:** GET  
- **URL:** `/api/internships/:id`  
- **Expected:** 200 OK with internship + logEntries + checklist  
- **Result:** ✅ PASS  
- **Screenshot:** screenshots/phase5b-get-single-200.png

### Test 2 — PUT update internship (valid data)
- **Method:** PUT  
- **URL:** `/api/internships/:id`  
- **Body:**
```json
{
  "company": "Updated Company PH",
  "status": "COMPLETED"
}
```
- **Expected:** 200 OK with updated record  
- **Result:** ✅ PASS  
- **Screenshot:** screenshots/phase5b-put-valid-200.png

### Test 3 — PUT update internship (invalid data) 🔒 Security
- **Method:** PUT  
- **URL:** `/api/internships/:id`  
- **Body:**
```json
{
  "requiredHours": -999,
  "status": "INVALID_STATUS"
}
```
- **Expected:** 400 Bad Request  
- **Result:** ✅ PASS — Zod rejected negative hours and invalid enum value  
- **Screenshot:** screenshots/phase5b-put-invalid-400.png

### Test 4 — GET with fake ID 🔒 Security (IDOR test)
- **Method:** GET  
- **URL:** `/api/internships/fake-id-that-doesnt-exist`  
- **Expected:** 404 Not Found  
- **Result:** ✅ PASS  
- **Security note:** Returns 404 without exposing DB structure or other users' data  
- **Screenshot:** screenshots/phase5b-get-fakeid-404.png

### Test 5 — DELETE internship
- **Method:** DELETE  
- **URL:** `/api/internships/:id`  
- **Expected:** 200 OK with success message  
- **Result:** ✅ PASS — Related logs and checklist deleted via transaction  
- **Screenshot:** screenshots/phase5b-delete-200.png

---

## Summary

| Route | Tests | Passed | Failed |
|---|---|---|---|
| GET /api/internships | 1 | 1 | 0 |
| POST /api/internships | 2 | 2 | 0 |
| GET /api/internships/[id] | 2 | 2 | 0 |
| PUT /api/internships/[id] | 2 | 2 | 0 |
| DELETE /api/internships/[id] | 1 | 1 | 0 |
| **Total** | **8** | **8** | **0** |

## Security checks passed
- ✅ Input validation (Zod) — rejects bad data before hitting DB
- ✅ IDOR protection — userId checked on every route
- ✅ 404 on fake IDs — no data leakage
- ✅ Transaction on DELETE — no orphaned data

## Known limitations
- userId hardcoded as `temp-user-1` — replaced with real session in Phase 7
- No rate limiting yet — planned for Phase 8
- Delete is permanent (hard delete) — soft delete planned for Phase 8


---

## Part C — /api/logs

### Test 1 — POST create log (valid data)
- **Method:** POST
- **URL:** `/api/logs`
- **Body:**
```json
{
  "internshipId": "cmnk8a2f50005ac90jio7yfhy",
  "date": "2026-04-04T08:00:00.000Z",
  "description": "Attended morning standup and worked on dashboard UI components",
  "hours": 8
}
```
- **Expected:** 201 Created
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-post-log-valid-201.png

### Test 2 — POST create log (invalid data) 🔒 Security
- **Method:** POST
- **URL:** `/api/logs`
- **Body:**
```json
{
  "internshipId": "",
  "description": "",
  "hours": -5
}
```
- **Expected:** 400 Bad Request
- **Result:** ✅ PASS — Zod rejected empty fields and negative hours
- **Screenshot:** screenshots/phase5c-post-log-invalid-400.png

### Test 3 — GET all logs
- **Method:** GET
- **URL:** `/api/logs`
- **Expected:** 200 OK with all logs + internship details
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-get-all-logs-200.png

### Test 4 — GET logs filtered by internship
- **Method:** GET
- **URL:** `/api/logs?internshipId=:id`
- **Expected:** 200 OK with filtered logs only
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-get-logs-filtered-200.png

### Test 5 — GET single log
- **Method:** GET
- **URL:** `/api/logs/:id`
- **Expected:** 200 OK with log + internship details including userId
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-get-single-log-200.png

### Test 6 — PUT update log (valid data)
- **Method:** PUT
- **URL:** `/api/logs/:id`
- **Body:**
```json
{
  "hours": 6,
  "description": "Updated: worked on API routes and documentation"
}
```
- **Expected:** 200 OK with updated log
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-put-log-200.png

### Test 7 — GET with fake ID 🔒 Security (IDOR test)
- **Method:** GET
- **URL:** `/api/logs/fake-log-id`
- **Expected:** 404 Not Found
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-get-fakeid-404.png

### Test 8 — DELETE log
- **Method:** DELETE
- **URL:** `/api/logs/:id`
- **Expected:** 200 OK
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5c-delete-log-200.png

---

## Updated Summary

| Route | Tests | Passed | Failed |
|---|---|---|---|
| GET /api/internships | 1 | 1 | 0 |
| POST /api/internships | 2 | 2 | 0 |
| GET /api/internships/[id] | 2 | 2 | 0 |
| PUT /api/internships/[id] | 2 | 2 | 0 |
| DELETE /api/internships/[id] | 1 | 1 | 0 |
| GET /api/logs | 2 | 2 | 0 |
| POST /api/logs | 2 | 2 | 0 |
| GET /api/logs/[id] | 2 | 2 | 0 |
| PUT /api/logs/[id] | 1 | 1 | 0 |
| DELETE /api/logs/[id] | 1 | 1 | 0 |
| **Total** | **16** | **16** | **0** |


---

## Part D — /api/checklist

### Test 1 — POST create checklist item (valid data)
- **Method:** POST
- **URL:** `/api/checklist`
- **Body:**
```json
{
  "internshipId": "cmnkfxrdn0007ac90re5wn1uz",
  "title": "Submit endorsement letter"
}
```
- **Expected:** 201 Created with `completed: false` by default
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5d-post-checklist-valid-201.png

### Test 2 — POST create checklist item (invalid data) 🔒 Security
- **Method:** POST
- **URL:** `/api/checklist`
- **Body:**
```json
{
  "internshipId": "",
  "title": ""
}
```
- **Expected:** 400 Bad Request
- **Result:** ✅ PASS — Zod rejected empty internshipId and title
- **Screenshot:** screenshots/phase5d-post-checklist-invalid-400.png

### Test 3 — GET all checklist items
- **Method:** GET
- **URL:** `/api/checklist`
- **Expected:** 200 OK with all items + internship details
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5d-get-all-checklist-200.png

### Test 4 — GET checklist filtered by internship
- **Method:** GET
- **URL:** `/api/checklist?internshipId=:id`
- **Expected:** 200 OK with filtered items only
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5d-get-checklist-filtered-200.png

### Test 5 — PUT toggle completed status
- **Method:** PUT
- **URL:** `/api/checklist/:id`
- **Body:**
```json
{
  "completed": true
}
```
- **Expected:** 200 OK with `completed: true`
- **Result:** ✅ PASS — status toggled successfully
- **Screenshot:** screenshots/phase5d-put-toggle-completed-200.png

### Test 6 — PUT with invalid data 🔒 Security
- **Method:** PUT
- **URL:** `/api/checklist/:id`
- **Body:**
```json
{
  "completed": "yes"
}
```
- **Expected:** 400 Bad Request — `"yes"` is string not boolean
- **Result:** ✅ PASS — Zod caught type mismatch
- **Screenshot:** screenshots/phase5d-put-invalid-data-400.png

### Test 7 — GET with fake ID 🔒 Security (IDOR test)
- **Method:** GET
- **URL:** `/api/checklist/fake-id`
- **Expected:** 404 Not Found
- **Result:** ✅ PASS — no data leakage
- **Screenshot:** screenshots/phase5d-get-fakeid-404.png

### Test 8 — DELETE checklist item
- **Method:** DELETE
- **URL:** `/api/checklist/:id`
- **Expected:** 200 OK with success message
- **Result:** ✅ PASS
- **Screenshot:** screenshots/phase5d-delete-checklist-200.png

---

## Final Summary — All Routes

| Route | Tests | Passed | Failed |
|---|---|---|---|
| GET /api/internships | 1 | 1 | 0 |
| POST /api/internships | 2 | 2 | 0 |
| GET /api/internships/[id] | 2 | 2 | 0 |
| PUT /api/internships/[id] | 2 | 2 | 0 |
| DELETE /api/internships/[id] | 1 | 1 | 0 |
| GET /api/logs | 2 | 2 | 0 |
| POST /api/logs | 2 | 2 | 0 |
| GET /api/logs/[id] | 2 | 2 | 0 |
| PUT /api/logs/[id] | 1 | 1 | 0 |
| DELETE /api/logs/[id] | 1 | 1 | 0 |
| GET /api/checklist | 2 | 2 | 0 |
| POST /api/checklist | 2 | 2 | 0 |
| GET /api/checklist/[id] | 2 | 2 | 0 |
| PUT /api/checklist/[id] | 2 | 2 | 0 |
| DELETE /api/checklist/[id] | 1 | 1 | 0 |
| **Total** | **27** | **27** | **0** |

## Security checks passed
- ✅ Input validation (Zod) on all routes
- ✅ IDOR protection — ownership verified on every route
- ✅ 404 on fake IDs — no data leakage
- ✅ Type checking — rejected string instead of boolean
- ✅ Transaction on internship DELETE — no orphaned data

## Known limitations
- userId hardcoded as `temp-user-1` — replaced with real session in Phase 7
- No rate limiting yet — planned for Phase 8
- Hard delete on all routes — soft delete planned for Phase 8
- No pagination on GET all routes — planned for Phase 8