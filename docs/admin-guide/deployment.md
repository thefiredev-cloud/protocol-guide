# Deployment Options

Choose the right deployment strategy for your department.

---

## Deployment Models

### Option 1: Web App (PWA) – Recommended

**Best for**: Most departments

Protocol Guide runs as a Progressive Web App (PWA) – no app store required.

**Advantages:**
- ✅ No app store approval delays
- ✅ Instant updates for all users
- ✅ Works on any device with a browser
- ✅ No device management required
- ✅ Offline capability via service workers
- ✅ Installs to home screen like a native app

**Deployment Steps:**
1. Users visit **protocol-guide.com**
2. Sign in with department credentials
3. Add to home screen (optional but recommended)

**MDM Note:** PWA installation can be pushed via MDM bookmark/web clip.

### Option 2: MDM Managed Deployment

**Best for**: Departments with managed devices

Use your Mobile Device Management solution to deploy Protocol Guide.

**Supported MDM Platforms:**
- Microsoft Intune
- VMware Workspace ONE
- Jamf (Apple devices)
- Google Workspace (Android)

**What You Can Configure via MDM:**
- Pre-configure website shortcut/web clip
- Auto-sign-in via SSO integration
- Managed browser configurations
- Network/VPN requirements

**Deployment Steps:**
1. Create web clip pointing to protocol-guide.com
2. Configure SSO passthrough (if available)
3. Push to managed devices
4. Users launch from home screen

### Option 3: Kiosk/Shared Device Mode

**Best for**: Apparatus-mounted tablets, station shared devices

Configure devices for shared use among multiple users.

**Setup:**
1. Install Protocol Guide PWA on device
2. Configure "Quick Switch" user mode
3. Users tap their name to switch accounts
4. Or use "shared device" account for anonymous access

**Recommended Settings:**
- Auto-logout after 30 minutes idle
- Clear personal data on logout
- Offline protocols pre-loaded
- Kiosk mode to prevent other app access (optional)

---

## Network Requirements

### Connectivity

| Feature | Network Required |
|---------|-----------------|
| Initial setup | Yes |
| Protocol search (AI) | Yes |
| Voice transcription | Yes |
| Offline protocols | No (after download) |
| Bookmarks (local) | No |
| Bookmark sync | Yes |

### Bandwidth Estimates

| Activity | Bandwidth |
|----------|-----------|
| Single search query | ~50-100 KB |
| Voice transcription | ~100-200 KB |
| Offline protocol download | 50-500 MB (one-time) |
| Daily active use | ~5-20 MB/day |

### Firewall/Proxy Configuration

Allow the following domains:

```
# Primary application
*.protocol-guide.com
protocol-guide.com

# Authentication (SSO)
*.supabase.co
auth.protocol-guide.com

# Analytics (optional)
*.google-analytics.com

# CDN/Assets
*.cloudflare.com
*.jsdelivr.net
```

**Ports:**
- HTTPS (443) – Required
- WSS (443) – For real-time features

### Offline Considerations

Pre-download offline protocols while on station Wi-Fi:
1. Configure Wi-Fi at each station
2. Set app to auto-download on Wi-Fi
3. Protocols sync automatically when connected

---

## Device Recommendations

### Recommended Devices

**Smartphones:**
- iPhone 12 or newer (iOS 15+)
- Google Pixel 6 or newer
- Samsung Galaxy S21 or newer

**Tablets (Apparatus):**
- iPad (9th gen or newer)
- Samsung Galaxy Tab A8 or newer

**Rugged Devices:**
- Zebra TC52/TC72 series
- Samsung Galaxy XCover series
- Kyocera DuraForce

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 2 GB | 4+ GB |
| Storage | 16 GB (4 GB free) | 64+ GB |
| Screen | 5" | 6"+ |
| OS | iOS 14, Android 8 | Latest |

### Accessories

**Recommended for apparatus:**
- Vehicle mount for tablet
- Charging cable (12V adapter)
- Screen protector
- Rugged case

---

## Enterprise SSO Setup

### Supported Providers

- **Azure Active Directory** (Microsoft 365)
- **Okta**
- **Google Workspace**
- **OneLogin**
- **Custom SAML 2.0**
- **Custom OIDC**

### Setup Process

1. **Contact Protocol Guide Support** to initiate SSO setup
2. **Provide your IdP metadata** (SAML) or configuration (OIDC)
3. **We configure** Protocol Guide for your domain
4. **Test** with pilot users
5. **Enable** for all users

### SSO Configuration Details

**SAML Configuration:**
- Entity ID: `https://protocol-guide.com/saml`
- ACS URL: `https://auth.protocol-guide.com/saml/acs`
- NameID Format: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`

**Required Claims:**
- `email` – User's email address (required)
- `name` – Display name (optional)
- `groups` – Group memberships (optional, for auto-permissions)

### User Provisioning

**Just-in-Time (JIT) Provisioning:**
- Users created on first sign-in
- Automatically assigned to department
- Group membership based on IdP claims

**SCIM Provisioning (Enterprise+):**
- Automatic user sync from IdP
- Create, update, deactivate users
- Group membership sync

---

## Rollout Strategies

### Strategy 1: Pilot → Phased → Full

**Timeline:** 4-6 weeks

**Week 1-2: Pilot**
- 10-20 tech-savvy users
- Gather feedback
- Resolve issues

**Week 3-4: Phased Rollout**
- Deploy by station/shift
- Training sessions per group
- Monitor adoption

**Week 5-6: Full Deployment**
- All users onboarded
- Support structure in place
- Analytics tracking

### Strategy 2: Big Bang

**Timeline:** 1-2 weeks

**Best for:** Smaller departments (<50 users)

1. Complete all preparation
2. All-hands training session
3. Simultaneous activation
4. Intensive support first week

### Strategy 3: New Hire Integration

**Timeline:** Ongoing

**Best for:** Departments wanting gradual adoption

1. New hires onboarded to Protocol Guide
2. Existing staff invited but optional
3. Natural adoption over time
4. Full mandate after 6-12 months

---

## Change Management

### Communication Plan

**Before Launch:**
- Announce Protocol Guide is coming
- Share benefits and purpose
- Set expectations

**At Launch:**
- Clear instructions for access
- Training schedule
- Support contacts

**After Launch:**
- Success stories
- Usage tips
- Feedback collection

### Training Plan

| Audience | Format | Duration | Content |
|----------|--------|----------|---------|
| All Users | Video + Guide | 15 min | Basic search, voice, offline |
| Power Users | Live session | 30 min | Advanced features, tips |
| Admins | Live session | 60 min | Full admin capabilities |
| Training Officers | Live session | 45 min | Analytics, coaching |

### Addressing Resistance

**Common concerns and responses:**

| Concern | Response |
|---------|----------|
| "I know the protocols already" | "Great! This is faster for edge cases and backup" |
| "Technology fails in the field" | "Offline mode works without signal" |
| "I prefer paper protocols" | "You can still use paper; this is an additional tool" |
| "Learning curve" | "Most searches take 5 seconds to learn" |

---

## Post-Deployment

### Monitoring Success

**Key Metrics to Track:**
- % of users who have signed in
- Average searches per user per day
- Most-searched protocols
- User satisfaction (surveys)

**Healthy Benchmarks:**
- 80%+ users active within 30 days
- 2-5 searches per user per shift
- <5% support tickets related to access issues

### Ongoing Management

**Weekly:**
- Review support tickets
- Check system status

**Monthly:**
- Review usage analytics
- Identify training needs
- Update custom protocols

**Quarterly:**
- User satisfaction survey
- Review with Customer Success
- Plan improvements

---

## Next Steps

- [Set up user management →](./user-management.md)
- [Configure analytics →](./analytics.md)
- [Learn about SSO integration →](./sso-integration.md)

---

**Need help?** Contact enterprise-support@protocol-guide.com
