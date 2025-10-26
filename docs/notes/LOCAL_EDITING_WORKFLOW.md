# Local Editing Workflow for Claude Code Changes

## Step 1: Create Pull Request (Web Interface)

Since GitHub CLI is not available, create the PR via web:

1. **Visit this URL:**
   ```
   https://github.com/thefiredev-cloud/Medic-Bot/pull/new/claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
   ```

2. **Fill in the PR details:**
   - **Title:** `feat: comprehensive UX enhancements and remaining Phase A implementations`
   - **Description:** Copy from the section below

---

### PR Description (Copy This):

```markdown
## Summary
Completes remaining Phase A plans and adds comprehensive UX improvements for production readiness.

## Changes Included

### Phase A Completions
- ✅ Build fixes and integrations
- ✅ Offline sync implementation
- ✅ Performance optimizations

### UX Enhancements (6 New Components)
- **ErrorBoundary**: Graceful error handling with fallback UI
- **Toast**: User feedback notifications
- **SettingsPanel**: Centralized app configuration
- **KeyboardShortcuts**: Power user navigation (Cmd/Ctrl+K, etc.)
- **ThemeToggle**: Dark/light mode support
- **WebVitalsReporter**: Performance monitoring (CLS, FID, LCP)

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility

### Technical Improvements
- Type-safe component implementations
- Error boundaries at critical paths
- Performance monitoring integration
- Responsive design patterns

## Testing
- [x] Build passes (`npm run build`)
- [x] Type checking passes (`npm run type-check`)
- [x] Lint passes (`npm run lint`)
- [x] All components render without errors

## Integration with ImageTrend AI Assist
This PR maintains compatibility with LA County Fire's ImageTrend Elite Field AI Assist rollout (OA-41). Medic-Bot serves as complementary clinical decision support during patient care, while ImageTrend handles post-incident ePCR documentation.

## Related Issues
Closes remaining Phase A tasks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

3. **Click "Create Pull Request"**

---

## Step 2: Fetch and Checkout the Feature Branch Locally

To edit the changes Claude Code made, fetch the branch to your local machine:

```bash
# Make sure you're in the project directory
cd /Users/tanner-osterkamp/Medic-Bot

# Fetch all remote branches (including the Claude branch)
git fetch origin

# Checkout the feature branch
git checkout claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
```

**Alternative (if branch doesn't exist locally):**
```bash
git checkout -b claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8 origin/claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
```

---

## Step 3: Verify What Changed

Review the commits Claude Code made:

```bash
# See commit history on this branch
git log --oneline main..HEAD

# See all changed files
git diff main --name-only

# See detailed changes
git diff main
```

**Expected files changed:**
- `app/components/ErrorBoundary.tsx` (new)
- `app/components/Toast.tsx` (new)
- `app/components/SettingsPanel.tsx` (new)
- `app/components/KeyboardShortcuts.tsx` (new)
- `app/components/ThemeToggle.tsx` (new)
- `app/components/WebVitalsReporter.tsx` (new)
- `app/page.tsx` (modified - integrations)
- `app/layout.tsx` (modified - global providers)

---

## Step 4: Make Your Local Edits

Now you can edit any files using your preferred editor (VS Code, etc.):

```bash
# Open in VS Code
code .

# Or use any editor
# nano app/components/ErrorBoundary.tsx
# vim app/components/Toast.tsx
```

**Common edits you might want to make:**
- Adjust styling/colors
- Change default settings
- Modify keyboard shortcuts
- Update component props
- Fix bugs or improve code

---

## Step 5: Test Your Changes Locally

After making edits, test everything works:

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# In separate terminals, run tests:
npm run lint
npm run type-check
npm run build
```

**Access the app:**
- Open http://localhost:3000
- Test the new components:
  - Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) for keyboard shortcuts
  - Click settings icon for SettingsPanel
  - Toggle theme (if visible)
  - Trigger errors to test ErrorBoundary

---

## Step 6: Commit Your Local Changes

If you made edits and want to update the PR:

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "refactor: adjust ErrorBoundary styling and Toast positioning"

# Push to the feature branch (updates the PR automatically)
git push origin claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
```

**Important:** Pushing to the feature branch will automatically update the open PR!

---

## Step 7: Merge the PR (When Ready)

Once you're happy with all changes:

### Option A: Merge via GitHub Web Interface
1. Go to your PR: https://github.com/thefiredev-cloud/Medic-Bot/pulls
2. Click "Merge Pull Request"
3. Confirm merge
4. Delete feature branch (optional cleanup)

### Option B: Merge Locally (If You Have Permissions)
```bash
# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Merge the feature branch
git merge claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8

# Push to main
git push origin main

# Delete feature branch (optional)
git branch -d claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
git push origin --delete claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
```

---

## Step 8: Return to Main Branch

After merging, switch back to main:

```bash
# Checkout main
git checkout main

# Pull the merged changes
git pull origin main

# Verify everything is up to date
git log --oneline -5
```

---

## Quick Reference: File Locations

Here's where to find the new components Claude Code created:

```
app/
├── components/
│   ├── ErrorBoundary.tsx       # Error handling wrapper
│   ├── Toast.tsx                # Notification system
│   ├── SettingsPanel.tsx        # User preferences
│   ├── KeyboardShortcuts.tsx    # Keyboard nav overlay
│   ├── ThemeToggle.tsx          # Dark/light mode
│   └── WebVitalsReporter.tsx    # Performance monitoring
├── layout.tsx                   # Global providers added here
└── page.tsx                     # Components integrated here
```

---

## Troubleshooting

### Issue: "Branch doesn't exist locally"
```bash
# Fetch all branches
git fetch --all

# List all remote branches
git branch -r

# Checkout the branch
git checkout claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
```

### Issue: "Merge conflicts"
```bash
# Pull latest main
git checkout main
git pull origin main

# Rebase feature branch on main
git checkout claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
git rebase main

# Resolve conflicts in your editor
# Then:
git add .
git rebase --continue
git push --force-with-lease origin claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
```

### Issue: "Can't push to feature branch"
Make sure you're on the correct branch:
```bash
git branch  # Shows current branch (should have * next to feature branch)
git status  # Shows what will be committed
```

---

## Summary

1. ✅ Create PR via web: https://github.com/thefiredev-cloud/Medic-Bot/pull/new/claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8
2. ✅ Fetch branch: `git fetch origin`
3. ✅ Checkout branch: `git checkout claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8`
4. ✅ Make edits in your editor
5. ✅ Test: `npm run dev`, `npm run lint`, `npm run build`
6. ✅ Commit: `git add . && git commit -m "your message"`
7. ✅ Push: `git push origin claude/finish-remaining-plans-011CUT7EBCn8dRP5TidiYxn8`
8. ✅ Merge PR via GitHub web interface
9. ✅ Checkout main: `git checkout main && git pull origin main`

---

**Questions?** Let me know if you need help with any step!
