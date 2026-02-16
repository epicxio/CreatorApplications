# Creator Signup Notification Setup

When a new creator registers (Creator Sign Up), the backend now triggers a `creator_signup` notification event. For Super Admins (or other roles) to **see this in the Notification Center** and get a **notification badge**, a Notification Type must be configured.

## Steps (Notification Control Center)

1. Go to **Roles & Permissions → Notification Control Center** (or your app’s path to notification types).
2. **Create** a new Notification Type (or edit an existing one) with:
   - **Event type:** `creator_signup`
   - **Title:** e.g. `New Creator Registration`
   - **Message template:** e.g. `{{userName}} ({{userEmail}}) has requested creator access.`
   - **Roles:** Add **Super Admin** (and any other roles that should be notified).
   - **Channels:** Enable **In-App** (and email/push if desired).
   - **Active:** On.

3. Save. New creator signups will create in-app notifications for users with the selected roles, and the notification badge will update when they have unread notifications.

## Template variables for `creator_signup`

- `userName`, `userEmail`, `creatorName`, `creatorEmail`, `username`, `phoneNumber`
