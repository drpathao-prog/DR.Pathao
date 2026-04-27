# Security Specification - DR.Pathao

## Data Invariants
1. A reminder must belong to exactly one user.
2. A calendar event must belong to exactly one user OR be in the master_calendar (managed by admins).
3. A user can only read and write their own profile, reminders, and personal events.
4. Doctors' profiles are public and read-only for users.
5. Appointments must reference a valid user and a valid doctor.
6. Prescriptions must be issued to a valid user.

## The "Dirty Dozen" Payloads

### 1. Identity Spoofing (Reminder)
Attempt to create a reminder for another user.
```json
{
  "path": "users/victim-uid/reminders/fake-id",
  "method": "create",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "id": "fake-id",
    "userId": "victim-uid",
    "name": "Malicious Pill",
    "dosage": "1g",
    "time": "08:00",
    "taken": false
  }
}
```
**Expected Result:** PERMISSION_DENIED

### 2. Privilege Escalation (User Role)
Attempt to set own role to 'admin' (even though only 'patient' is allowed in enum, we check for shadow fields).
```json
{
  "path": "users/attacker-uid",
  "method": "create",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "id": "attacker-uid",
    "name": "Attacker",
    "email": "attacker@example.com",
    "role": "admin"
  }
}
```
**Expected Result:** PERMISSION_DENIED

### 3. Resource Poisoning (Giant ID)
Attempt to create a document with a massive ID.
```json
{
  "path": "users/attacker-uid/reminders/a".repeat(1025),
  "method": "create",
  "auth": { "uid": "attacker-uid" },
  "data": { ... }
}
```
**Expected Result:** PERMISSION_DENIED

### 4. Cross-User Read (Profile)
Attempt to read another user's profile.
```json
{
  "path": "users/victim-uid",
  "method": "get",
  "auth": { "uid": "attacker-uid" }
}
```
**Expected Result:** PERMISSION_DENIED

### 5. Ghost Field Injection (Appointment)
Attempt to confirm an appointment without permission.
```json
{
  "path": "appointments/app-id",
  "method": "update",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "status": "confirmed"
  }
}
```
**Expected Result:** PERMISSION_DENIED (unless attacker is a special role or logic strictly prevents non-owners from changing status)

### 6. Query Scraping (List Reminders)
Attempt to list all reminders in the entire system.
```json
{
  "path": "users/some-uid/reminders",
  "method": "list",
  "auth": { "uid": "attacker-uid" }
}
```
**Expected Result:** PERMISSION_DENIED

### 7. Immutable Field Modification (CreatedAt)
Attempt to change the `createdAt` timestamp.
```json
{
  "path": "users/attacker-uid/reminders/rem-id",
  "method": "update",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "createdAt": "2000-01-01T00:00:00Z"
  }
}
```
**Expected Result:** PERMISSION_DENIED

### 8. Value Type Poisoning (Frequency)
Attempt to set an invalid enum value for frequency.
```json
{
  "path": "users/attacker-uid/reminders/rem-id",
  "method": "create",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "frequency": "every-second"
  }
}
```
**Expected Result:** PERMISSION_DENIED

### 9. Orphaned Appointment
Attempt to create an appointment for a non-existent doctor.
```json
{
  "path": "appointments/new-app",
  "method": "create",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "doctorId": 999999,
    "userId": "attacker-uid",
    "status": "pending"
  }
}
```
**Expected Result:** PERMISSION_DENIED (relational sync check)

### 10. Spam Write (Master Calendar)
Attempt to write to the master calendar as a normal user.
```json
{
  "path": "master_calendar/evil-event",
  "method": "create",
  "auth": { "uid": "attacker-uid" },
  "data": { ... }
}
```
**Expected Result:** PERMISSION_DENIED

### 11. Partial Update Gap
Attempt to bypass validation by updating only one field with invalid data.
```json
{
  "path": "users/attacker-uid",
  "method": "update",
  "auth": { "uid": "attacker-uid" },
  "data": {
    "phone": "not-a-phone-number-extremely-long-string-to-exhaust-resources-..."
  }
}
```
**Expected Result:** PERMISSION_DENIED

### 12. Unverified Email Write
Attempt to write data when email is not verified.
```json
{
  "path": "users/attacker-uid/reminders/rem-id",
  "method": "create",
  "auth": { "uid": "attacker-uid", "token": { "email_verified": false } },
  "data": { ... }
}
```
**Expected Result:** PERMISSION_DENIED (for standard actions)
