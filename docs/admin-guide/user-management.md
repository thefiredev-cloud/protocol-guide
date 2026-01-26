# User Management

Manage your department's Protocol Guide users.

---

## User Roles

### Role Types

| Role | Permissions |
|------|-------------|
| **User** | Search protocols, bookmarks, history |
| **Training Officer** | User permissions + view team analytics |
| **Admin** | Full admin dashboard access |
| **Billing Admin** | Admin + billing/subscription management |
| **Super Admin** | All permissions + user role management |

### Role Assignment

1. Go to **Users** → Select user
2. Click **Edit Role**
3. Select new role
4. Save changes

---

## Adding Users

### Single User Invite

1. Navigate to **Users** → **Add User**
2. Enter information:
   - Email address (required)
   - First name (optional)
   - Last name (optional)
   - Role (default: User)
   - Groups (optional)
3. Click **Send Invite**

User receives:
- Welcome email with setup link
- Automatic department assignment
- 7-day expiration on invite link

### Bulk Import

1. Go to **Users** → **Bulk Import**
2. Download CSV template
3. Prepare your data:

```csv
email,first_name,last_name,role,groups
firefighter1@dept.gov,John,Smith,user,"Station 1,Paramedics"
firefighter2@dept.gov,Jane,Doe,user,"Station 2"
captain@dept.gov,Mike,Johnson,training_officer,"Station 1,Officers"
```

4. Upload CSV file
5. Review import preview
6. Confirm and send invites

### Resending Invites

For users who haven't activated:

1. Go to **Users** → **Pending Invites**
2. Find the user
3. Click **Resend** or **Copy Link**

---

## Managing Existing Users

### User Profile View

Click any user to see:
- Account status (Active/Pending/Disabled)
- Last sign-in date
- Search activity (count)
- Groups membership
- Role

### Edit User

1. Click user → **Edit**
2. Modify:
   - Display name
   - Role
   - Groups
   - Status
3. **Save Changes**

### Disable/Enable User

**Disable** a user (leaves employment, extended leave):
1. Click user → **Actions** → **Disable**
2. Confirm

Disabled users:
- Cannot sign in
- Retain all data
- Can be re-enabled later

**Re-enable** a user:
1. Filter to show disabled users
2. Click user → **Actions** → **Enable**

### Delete User

**Permanently delete** a user:
1. Click user → **Actions** → **Delete**
2. Type user's email to confirm
3. Confirm deletion

⚠️ **Warning:** Deletion is permanent and removes all user data.

---

## Groups

### Creating Groups

1. Go to **Users** → **Groups** → **New Group**
2. Enter:
   - Group name (e.g., "Station 1")
   - Description (optional)
   - Default settings (optional)
3. Click **Create**

### Group Types

| Type | Example | Use Case |
|------|---------|----------|
| Location | Station 1, District 5 | Organize by work location |
| Role | Paramedics, EMT-B | Organize by certification |
| Shift | A Shift, B Shift | Organize by schedule |
| Special | Training Officers, FTOs | Functional groups |

### Assigning Users to Groups

**Individual Assignment:**
1. Go to user profile
2. Click **Manage Groups**
3. Check/uncheck groups
4. Save

**Bulk Assignment:**
1. Go to **Users** → select multiple users (checkboxes)
2. Click **Bulk Actions** → **Add to Group**
3. Select group
4. Confirm

### Group Settings

Configure group-specific settings:

1. Go to **Groups** → select group → **Settings**
2. Configure:
   - **Default Region**: Override user's default region
   - **Featured Protocols**: Protocols shown on home screen
   - **Offline Protocols**: Pre-select protocols to cache
   - **Notifications**: Group-specific announcements

---

## User Activity

### Activity Dashboard

View user engagement at **Users** → **Activity**:

```
Active Users (30 days): 127/150 (85%)
Average Searches/User: 3.2/day
Most Active: Station 1 (4.1 searches/user/day)
Least Active: Station 5 (1.2 searches/user/day)
```

### Individual Activity

View any user's activity:
1. Click user profile
2. Go to **Activity** tab
3. See:
   - Sign-in history
   - Search count by day/week/month
   - Top protocols accessed
   - Bookmarks count

### Inactive User Report

Identify users who may need follow-up:

1. Go to **Users** → **Reports** → **Inactive Users**
2. Set threshold (e.g., "No sign-in for 30 days")
3. View list
4. Export or take action

---

## Self-Service Options

### User Self-Registration

If enabled, users can self-register with department email:

1. Go to **Settings** → **User Management** → **Self-Registration**
2. Enable self-registration
3. Configure:
   - Allowed email domains (e.g., `@yourdepartment.gov`)
   - Default role (User)
   - Default groups
   - Approval required (yes/no)

### Profile Self-Service

Users can manage their own:
- Display name
- Profile photo
- Notification preferences
- Password (if not SSO)

Admins can customize what users can change:
**Settings** → **User Management** → **Self-Service Options**

---

## Password Management

### For Non-SSO Users

**Reset User Password:**
1. Go to user profile
2. Click **Actions** → **Reset Password**
3. User receives password reset email

**Force Password Change:**
1. Go to user profile
2. Click **Actions** → **Require Password Change**
3. User must change password on next sign-in

### Password Policy

Configure at **Settings** → **Security** → **Password Policy**:

| Setting | Options |
|---------|---------|
| Minimum length | 8-24 characters |
| Require uppercase | Yes/No |
| Require number | Yes/No |
| Require special character | Yes/No |
| Password expiry | Never / 30 / 60 / 90 days |
| Password history | Prevent reuse of last 1-10 passwords |

---

## Session Management

### Active Sessions

View and manage active sessions:

1. Go to **Settings** → **Security** → **Sessions**
2. See all active sessions across department
3. Filter by user, device, location

### Session Settings

Configure at **Settings** → **Security** → **Session Settings**:

| Setting | Options | Recommendation |
|---------|---------|----------------|
| Session timeout | 1-72 hours | 8 hours for field use |
| Remember device | Yes/No | Yes for personal devices |
| Single session | Yes/No | No (allow multiple devices) |
| Concurrent sessions | 1-10 | 3-5 devices |

### Force Sign-Out

**Sign out a specific user:**
1. Go to user profile → **Sessions**
2. Click **Sign Out All Devices**

**Sign out all users (emergency):**
1. Go to **Settings** → **Security** → **Sessions**
2. Click **Sign Out All Users**
3. Confirm (requires Super Admin)

---

## Audit Log

### Viewing Audit Logs

Track all administrative actions:

1. Go to **Settings** → **Audit Log**
2. View entries showing:
   - Timestamp
   - Admin who took action
   - Action type
   - Affected user/resource
   - Details

### Logged Actions

| Action | Logged |
|--------|--------|
| User created | ✅ |
| User disabled/enabled | ✅ |
| User deleted | ✅ |
| Role changed | ✅ |
| Group membership changed | ✅ |
| Password reset | ✅ |
| SSO config changed | ✅ |
| Admin sign-in | ✅ |

### Exporting Audit Logs

1. Go to **Audit Log**
2. Set date range
3. Click **Export CSV**

Useful for compliance and security reviews.

---

## Compliance Features

### HIPAA Considerations

Protocol Guide does not store patient information. However, for departments requiring strict controls:

- **Access logging**: All protocol access logged
- **Session controls**: Automatic timeout
- **Audit trail**: Full administrative audit log
- **Data export**: User data exportable on request

### Data Retention

Configure at **Settings** → **Data** → **Retention**:

| Data Type | Default | Configurable |
|-----------|---------|--------------|
| Search history | 90 days | 30-365 days |
| Audit logs | 1 year | 1-7 years |
| Disabled user data | 90 days | 30-365 days |

### User Data Export

Export a user's data (GDPR/privacy compliance):

1. Go to user profile
2. Click **Actions** → **Export User Data**
3. Receive JSON file with all user data

---

## Next Steps

- [Set up analytics →](./analytics.md)
- [Configure security settings →](./security.md)
- [Upload custom protocols →](./custom-protocols.md)

---

**Need help?** Contact enterprise-support@protocol-guide.com
