# Getting Started for Administrators

A step-by-step guide to deploying Protocol Guide for your department.

---

## Onboarding Process

### Step 1: Contract & Setup

After signing your enterprise agreement:

1. **Welcome email** arrives within 24 hours with:
   - Admin account credentials
   - Onboarding schedule
   - Implementation guide

2. **Kickoff call** scheduled with your Customer Success Manager:
   - Review deployment goals
   - Identify technical contacts
   - Set implementation timeline

### Step 2: Admin Account Setup

1. **Access the Admin Portal**
   - Go to: admin.protocol-guide.com
   - Enter your temporary credentials
   - Set up your permanent password
   - Enable two-factor authentication (required)

2. **Configure Department Profile**
   - Upload department logo
   - Set department name
   - Select primary region/county
   - Configure contact information

3. **Invite Additional Admins**
   - Recommend: 2-3 administrators minimum
   - Ensures coverage during absences
   - Different admins can have different permissions

### Step 3: User Onboarding Plan

Work with your CSM to create a rollout plan:

**Pilot Phase (Week 1-2)**
- Select 10-20 pilot users
- Gather feedback
- Refine configuration

**Department Rollout (Week 3-4)**
- Gradual rollout by station/shift
- Training sessions
- Monitor adoption

**Full Deployment (Week 5+)**
- All users active
- Ongoing support
- Regular analytics review

---

## Admin Dashboard Overview

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 [Department Name] Admin Dashboard                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Overview                                                │
│  ├── Active Users: 127/150                                 │
│  ├── Searches Today: 342                                   │
│  ├── Top Protocol: Cardiac Arrest (89 views)              │
│  └── System Status: ✅ All Systems Operational             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Quick Actions                                              │
│  [Add Users] [View Analytics] [Upload Protocols] [Settings]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Menu

| Section | Purpose |
|---------|---------|
| **Dashboard** | Overview metrics and system status |
| **Users** | User management, invites, permissions |
| **Analytics** | Usage reports and insights |
| **Protocols** | Custom protocol management |
| **Settings** | Department and system configuration |
| **Billing** | Subscription and invoice management |
| **Support** | Help resources and ticket submission |

---

## First-Time Configuration Checklist

### Required Setup

- [ ] **Admin account secured** with strong password + 2FA
- [ ] **Department profile** complete with logo and info
- [ ] **Primary region selected** (affects default protocols)
- [ ] **Additional admins invited** (minimum 2 recommended)
- [ ] **SSO configured** (if using identity provider)

### Recommended Setup

- [ ] **User groups created** (by station, role, etc.)
- [ ] **Custom protocols uploaded** (department-specific)
- [ ] **Default preferences set** (theme, notifications)
- [ ] **Analytics reports scheduled** (weekly/monthly)
- [ ] **Pilot users identified** for initial rollout

---

## User Invite Methods

### Method 1: Email Invite

Best for: Small teams, individual additions

1. Go to **Users** → **Add User**
2. Enter user's email address
3. Set user role (User/Admin)
4. Click **Send Invite**

User receives email with:
- Link to create account
- Department auto-assignment
- Quick start guide

### Method 2: Bulk CSV Upload

Best for: Large deployments, initial rollout

1. Go to **Users** → **Bulk Import**
2. Download CSV template
3. Fill in user information:
   ```csv
   email,first_name,last_name,role,station
   john.smith@dept.gov,John,Smith,user,Station 1
   jane.doe@dept.gov,Jane,Doe,user,Station 2
   ```
4. Upload completed CSV
5. Review and confirm
6. Click **Send All Invites**

### Method 3: SSO Auto-Provisioning

Best for: Organizations with identity providers

1. Configure SSO integration (see SSO Guide)
2. Enable auto-provisioning
3. Set user attribute mappings
4. Users are created on first sign-in

---

## Setting Up User Groups

Organize users for easier management:

### Create a Group

1. Go to **Users** → **Groups** → **New Group**
2. Name the group (e.g., "Station 1," "Paramedics," "Training Officers")
3. Add description (optional)
4. Set group-specific settings:
   - Default protocols to display
   - Notification preferences
   - Feature access

### Group Examples

| Group Name | Members | Purpose |
|------------|---------|---------|
| Station 1 | All Station 1 personnel | Location-based organization |
| Paramedics | All paramedic-level staff | Skill-based protocols |
| New Hires | Personnel in first 90 days | Onboarding protocols |
| Training Officers | Training staff | Analytics access |

### Assign Users to Groups

1. Go to **Users** → select user(s)
2. Click **Manage Groups**
3. Check/uncheck group memberships
4. Save changes

---

## Communication Setup

### Welcome Message

Customize the message new users see:

1. Go to **Settings** → **Communications** → **Welcome Message**
2. Edit the default message
3. Include department-specific instructions
4. Save

**Example:**
```
Welcome to Protocol Guide!

As a member of [Department Name], you have access to all our 
protocols and treatment guidelines.

Need help? Contact your training officer or IT at x1234.

Stay safe out there!
```

### Announcement Banner

Display important messages to all users:

1. Go to **Settings** → **Communications** → **Announcements**
2. Click **New Announcement**
3. Enter message text
4. Set display duration
5. Publish

Use for:
- Protocol updates
- Training reminders
- System maintenance notices

---

## Testing Your Setup

Before full rollout, verify:

### Admin Functions
- [ ] Can log into admin dashboard
- [ ] Can invite/manage users
- [ ] Can view analytics
- [ ] Can access settings

### User Experience
- [ ] Create a test user account
- [ ] Sign in as test user
- [ ] Verify search works
- [ ] Verify correct region/protocols displayed
- [ ] Test offline mode
- [ ] Test voice search

### Integration Tests (if applicable)
- [ ] SSO sign-in works
- [ ] User provisioning functions
- [ ] Group sync working

---

## Training Resources

### For Administrators

- **Admin Training Video**: 30-minute overview (provided during onboarding)
- **Admin Documentation**: This guide
- **Office Hours**: Weekly Q&A with Customer Success team

### For End Users

- **User Quick Start Guide**: 1-page printable PDF
- **User Training Video**: 10-minute overview
- **In-App Help**: Built into the application

### Training Materials Available

| Resource | Format | Link/Access |
|----------|--------|-------------|
| Quick Start Guide | PDF | admin.protocol-guide.com/resources |
| User Training Video | Video | admin.protocol-guide.com/training |
| Admin Training Video | Video | Shared during onboarding |
| Tip Sheets | PDF | admin.protocol-guide.com/resources |
| FAQ | Web | support.protocol-guide.com/faq |

---

## Go-Live Checklist

Before launching to your department:

### Technical
- [ ] All configurations complete
- [ ] Test users verified functionality
- [ ] SSO working (if applicable)
- [ ] Custom protocols uploaded

### Administrative
- [ ] User list finalized
- [ ] Groups configured
- [ ] Welcome message customized
- [ ] Support contacts communicated

### Communication
- [ ] Launch announcement prepared
- [ ] Training schedule set
- [ ] Help resources distributed
- [ ] Feedback channel established

### Post-Launch
- [ ] Analytics monitoring started
- [ ] Support ticket process ready
- [ ] 30-day check-in scheduled with CSM

---

## Next Steps

- [Configure deployment options →](./deployment.md)
- [Learn user management →](./user-management.md)
- [Set up analytics →](./analytics.md)

---

**Need help?** Contact your Customer Success Manager or email enterprise-support@protocol-guide.com
