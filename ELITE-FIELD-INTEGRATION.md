# ImageTrend Elite Field CSS Architecture - Integration Guide

## Overview

This comprehensive CSS system redesigns Medic-Bot to match ImageTrend Elite Field's professional EMS software aesthetic, featuring a dark navy sidebar, red accents, white content areas, and a complete component library.

## File Location

**Main CSS File**: `/Users/tanner-osterkamp/Medic-Bot/app/elite-field-system.css`

## Integration Steps

### Option 1: Add to globals.css (Recommended)

Copy the contents of `elite-field-system.css` and append it to your existing `globals.css` file:

```bash
cat app/elite-field-system.css >> app/globals.css
```

### Option 2: Import as Separate File

Add to your main layout or app file:

```tsx
import '@/app/elite-field-system.css'
```

## Architecture Overview

### 1. Design Tokens (CSS Custom Properties)

All design values are stored as CSS variables in `:root`:

#### Color Palette
```css
--elite-sidebar-bg: #1a2332          /* Dark navy sidebar */
--elite-primary: #c41e3a             /* Emergency red */
--elite-secondary: #2c5aa0           /* Medical blue */
--elite-content-bg: #f5f7fa          /* Light gray content */
--elite-content-surface: #ffffff     /* White surfaces */
```

#### Typography Scale
```css
--elite-text-xs: 0.75rem    /* 12px */
--elite-text-sm: 0.875rem   /* 14px */
--elite-text-base: 1rem     /* 16px */
--elite-text-lg: 1.125rem   /* 18px */
--elite-text-xl: 1.25rem    /* 20px */
```

#### Spacing Scale (4px base)
```css
--elite-space-1: 0.25rem    /* 4px */
--elite-space-2: 0.5rem     /* 8px */
--elite-space-3: 0.75rem    /* 12px */
--elite-space-4: 1rem       /* 16px */
--elite-space-6: 1.5rem     /* 24px */
--elite-space-8: 2rem       /* 32px */
```

## Layout System

### 3-Column Grid Layout

```tsx
<div className="elite-app-container">
  <div className="elite-toolbar">
    {/* Top navigation bar */}
  </div>

  <aside className="elite-sidebar">
    {/* Left navigation */}
  </aside>

  <main className="elite-content">
    {/* Main content area */}
  </main>

  <aside className="elite-quickbar">
    {/* Right quick actions */}
  </aside>

  <footer className="elite-statusbar">
    {/* Bottom status bar */}
  </footer>
</div>
```

### Responsive Breakpoints

- **Mobile (< 768px)**: No sidebars, content only
- **Tablet (769px - 1024px)**: Collapsed sidebar only
- **Desktop (> 1024px)**: Full 3-column layout

## Component Usage Examples

### Sidebar Navigation

```tsx
<aside className="elite-sidebar">
  <div className="elite-sidebar-header">
    <img src="/logo.svg" className="elite-sidebar-logo" alt="Logo" />
    <h1 className="elite-sidebar-title">Medic-Bot</h1>
  </div>

  <nav>
    <section className="elite-sidebar-section is-expanded">
      <header className="elite-sidebar-section-header">
        <span>Patient Care</span>
        <svg className="elite-sidebar-section-icon">→</svg>
      </header>

      <div className="elite-sidebar-section-content">
        <a href="/assessment" className="elite-sidebar-item is-active">
          <svg className="elite-sidebar-item-icon">📋</svg>
          <span className="elite-sidebar-item-text">Assessment</span>
          <span className="elite-badge elite-badge-danger">3</span>
        </a>

        <a href="/vitals" className="elite-sidebar-item">
          <svg className="elite-sidebar-item-icon">❤️</svg>
          <span className="elite-sidebar-item-text">Vital Signs</span>
        </a>
      </div>
    </section>
  </nav>
</aside>
```

### Toolbar

```tsx
<header className="elite-toolbar">
  <div className="elite-toolbar-section">
    <button className="elite-button elite-button-ghost elite-button-icon-only">
      <svg className="elite-button-icon">☰</svg>
    </button>
    <div>
      <h1 className="elite-toolbar-title">Patient Assessment</h1>
      <p className="elite-toolbar-subtitle">Incident #2024-001234</p>
    </div>
  </div>

  <div className="elite-toolbar-section">
    <div className="elite-toolbar-search">
      <input type="search" placeholder="Search..." />
    </div>
  </div>

  <div className="elite-toolbar-section elite-toolbar-actions">
    <button className="elite-button elite-button-secondary">
      Cancel
    </button>
    <button className="elite-button elite-button-save">
      <svg className="elite-button-icon">💾</svg>
      Save Draft
    </button>
    <button className="elite-button elite-button-post">
      <svg className="elite-button-icon">✓</svg>
      Post to CAD
    </button>
  </div>
</header>
```

### Content Area with Sections

```tsx
<main className="elite-content">
  <header className="elite-content-header">
    <h1 className="elite-content-title">Patient Information</h1>
    <p className="elite-content-subtitle">Complete all required fields</p>
  </header>

  <div className="elite-content-body">
    <section className="elite-content-section">
      <header className="elite-content-section-header">
        <h2 className="elite-content-section-title">Demographics</h2>
        <div className="elite-toggle-group">
          <button className="elite-toggle-item is-active">Edit</button>
          <button className="elite-toggle-item">View</button>
        </div>
      </header>

      <div className="elite-form-grid-2">
        {/* Form fields */}
      </div>
    </section>
  </div>
</main>
```

### Form Fields

```tsx
{/* Text Input */}
<div className="elite-form-field">
  <label className="elite-form-field-label is-required">
    Patient Name
  </label>
  <input
    type="text"
    className="elite-form-field-input"
    placeholder="Enter full name"
  />
  <span className="elite-form-field-hint">
    Last, First Middle
  </span>
</div>

{/* Error State */}
<div className="elite-form-field is-error">
  <label className="elite-form-field-label is-required">
    Date of Birth
  </label>
  <input
    type="date"
    className="elite-form-field-input"
  />
  <span className="elite-form-field-error">
    Date of birth is required
  </span>
</div>

{/* Select Dropdown */}
<div className="elite-form-field">
  <label className="elite-form-field-label">Gender</label>
  <select className="elite-form-field-input elite-form-field-select">
    <option>Select...</option>
    <option>Male</option>
    <option>Female</option>
    <option>Other</option>
  </select>
</div>

{/* Textarea */}
<div className="elite-form-field">
  <label className="elite-form-field-label">Chief Complaint</label>
  <textarea
    className="elite-form-field-input elite-form-field-textarea"
    placeholder="Describe primary complaint..."
  />
</div>
```

### Form Grids

```tsx
{/* 2-column grid */}
<div className="elite-form-grid-2">
  <div className="elite-form-field">...</div>
  <div className="elite-form-field">...</div>
</div>

{/* 3-column grid */}
<div className="elite-form-grid-3">
  <div className="elite-form-field">...</div>
  <div className="elite-form-field">...</div>
  <div className="elite-form-field">...</div>
</div>

{/* Auto-fit responsive grid */}
<div className="elite-form-grid">
  <div className="elite-form-field">...</div>
  <div className="elite-form-field">...</div>
  {/* Automatically wraps based on space */}
</div>
```

### Buttons

```tsx
{/* Primary/Save Button */}
<button className="elite-button elite-button-save">
  <svg className="elite-button-icon">💾</svg>
  Save Draft
</button>

{/* Post Button (Emergency Action) */}
<button className="elite-button elite-button-post">
  <svg className="elite-button-icon">✓</svg>
  Post to CAD
</button>

{/* Danger Button */}
<button className="elite-button elite-button-danger">
  <svg className="elite-button-icon">🗑️</svg>
  Delete
</button>

{/* Secondary Button */}
<button className="elite-button elite-button-secondary">
  Cancel
</button>

{/* Ghost Button */}
<button className="elite-button elite-button-ghost">
  More Options
</button>

{/* Icon Only */}
<button className="elite-button elite-button-icon-only">
  <svg className="elite-button-icon">⋮</svg>
</button>

{/* Sizes */}
<button className="elite-button elite-button-primary elite-button-sm">Small</button>
<button className="elite-button elite-button-primary">Default</button>
<button className="elite-button elite-button-primary elite-button-lg">Large</button>

{/* Full Width */}
<button className="elite-button elite-button-primary elite-button-block">
  Full Width Button
</button>

{/* Disabled */}
<button className="elite-button elite-button-primary" disabled>
  Disabled
</button>
```

### Badges

```tsx
{/* Status Badges */}
<span className="elite-badge elite-badge-primary">Emergency</span>
<span className="elite-badge elite-badge-success">Completed</span>
<span className="elite-badge elite-badge-warning">Pending</span>
<span className="elite-badge elite-badge-danger">Critical</span>
<span className="elite-badge elite-badge-info">Info</span>

{/* Outline Badges */}
<span className="elite-badge elite-badge-outline-danger">High Priority</span>
<span className="elite-badge elite-badge-outline-success">Stable</span>

{/* Notification Dot */}
<span className="elite-badge elite-badge-dot elite-badge-danger"></span>
```

### Toggle Group

```tsx
<div className="elite-toggle-group">
  <button className="elite-toggle-item is-active">View</button>
  <button className="elite-toggle-item">Edit</button>
  <button className="elite-toggle-item">History</button>
</div>
```

### Quickbar (Right Sidebar)

```tsx
<aside className="elite-quickbar">
  <button className="elite-quickbar-item is-active">
    <svg className="elite-quickbar-item-icon">🏥</svg>
  </button>

  <button className="elite-quickbar-item">
    <svg className="elite-quickbar-item-icon">📋</svg>
  </button>

  <div className="elite-quickbar-divider"></div>

  <button className="elite-quickbar-item">
    <svg className="elite-quickbar-item-icon">⚙️</svg>
  </button>
</aside>
```

### Status Bar

```tsx
<footer className="elite-statusbar">
  <div className="elite-statusbar-section">
    <div className="elite-statusbar-item">
      <span className="elite-statusbar-indicator"></span>
      <span>Connected</span>
    </div>

    <div className="elite-statusbar-divider"></div>

    <div className="elite-statusbar-item">
      <svg className="elite-statusbar-icon">👤</svg>
      <span>John Doe, EMT-P</span>
    </div>
  </div>

  <div className="elite-statusbar-section">
    <div className="elite-statusbar-item">
      <svg className="elite-statusbar-icon">🚑</svg>
      <span>Unit 51</span>
    </div>

    <div className="elite-statusbar-divider"></div>

    <div className="elite-statusbar-item">
      <span>Last saved: 2 minutes ago</span>
    </div>
  </div>
</footer>
```

## State Classes

Apply these classes to components to indicate state:

```tsx
{/* Active state */}
<a className="elite-sidebar-item is-active">Dashboard</a>

{/* Expanded state */}
<section className="elite-sidebar-section is-expanded">...</section>

{/* Error state */}
<div className="elite-form-field is-error">...</div>

{/* Disabled state */}
<div className="is-disabled">...</div>

{/* Loading state */}
<div className="is-loading">Content loading...</div>

{/* Hidden state */}
<div className="is-hidden">...</div>
```

## Utility Classes

### Text Utilities

```tsx
<p className="text-xs">Extra small text</p>
<p className="text-sm">Small text</p>
<p className="text-base">Base text</p>
<p className="text-lg">Large text</p>

<p className="font-normal">Normal weight</p>
<p className="font-medium">Medium weight</p>
<p className="font-semibold">Semibold weight</p>
<p className="font-bold">Bold weight</p>

<p className="text-primary">Primary text color</p>
<p className="text-secondary">Secondary text color</p>
<p className="text-muted">Muted text color</p>

<p className="text-success">Success message</p>
<p className="text-warning">Warning message</p>
<p className="text-danger">Error message</p>

<p className="uppercase">UPPERCASE TEXT</p>
<p className="truncate">This text will be truncated...</p>
```

### Layout Utilities

```tsx
{/* Flexbox */}
<div className="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>

<div className="flex flex-col gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

{/* Grid */}
<div className="grid grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

{/* Spacing */}
<div className="p-4 m-2">Padded and margined</div>
<div className="mt-6 mb-4">Top and bottom margin</div>
<div className="mx-auto">Centered horizontally</div>
```

### Visual Utilities

```tsx
{/* Borders */}
<div className="border rounded-lg">Bordered with rounded corners</div>

{/* Shadows */}
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>

{/* Background */}
<div className="bg-surface">Surface background</div>
<div className="bg-primary text-inverse">Primary background</div>
```

### Responsive Utilities

```tsx
{/* Hidden on mobile, visible on desktop */}
<div className="hidden md:block">Desktop only</div>

{/* Visible on mobile, hidden on desktop */}
<div className="block md:hidden">Mobile only</div>

{/* Responsive flex */}
<div className="flex-col md:flex-row">
  Stacked on mobile, row on desktop
</div>
```

## Complete Example: Patient Assessment Page

```tsx
export default function PatientAssessment() {
  return (
    <div className="elite-app-container">
      {/* Toolbar */}
      <header className="elite-toolbar">
        <div className="elite-toolbar-section">
          <button className="elite-button elite-button-ghost elite-button-icon-only">
            <MenuIcon className="elite-button-icon" />
          </button>
          <div>
            <h1 className="elite-toolbar-title">Patient Assessment</h1>
            <p className="elite-toolbar-subtitle">Incident #2024-001234</p>
          </div>
        </div>

        <div className="elite-toolbar-section elite-toolbar-actions">
          <button className="elite-button elite-button-secondary">Cancel</button>
          <button className="elite-button elite-button-save">
            <SaveIcon className="elite-button-icon" />
            Save Draft
          </button>
          <button className="elite-button elite-button-post">
            <CheckIcon className="elite-button-icon" />
            Post to CAD
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="elite-sidebar">
        <div className="elite-sidebar-header">
          <img src="/logo.svg" className="elite-sidebar-logo" alt="Logo" />
          <h1 className="elite-sidebar-title">Medic-Bot</h1>
        </div>

        <nav>
          <section className="elite-sidebar-section is-expanded">
            <header className="elite-sidebar-section-header">
              <span>Patient Care</span>
              <ChevronIcon className="elite-sidebar-section-icon" />
            </header>

            <div className="elite-sidebar-section-content">
              <a href="/demographics" className="elite-sidebar-item">
                <UserIcon className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Demographics</span>
              </a>

              <a href="/assessment" className="elite-sidebar-item is-active">
                <ClipboardIcon className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Assessment</span>
                <span className="elite-badge elite-badge-danger">!</span>
              </a>

              <a href="/vitals" className="elite-sidebar-item">
                <HeartIcon className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Vital Signs</span>
              </a>
            </div>
          </section>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="elite-content">
        <header className="elite-content-header">
          <h1 className="elite-content-title">Patient Assessment</h1>
          <p className="elite-content-subtitle">
            Complete the patient assessment form
          </p>
        </header>

        <div className="elite-content-body">
          <section className="elite-content-section">
            <header className="elite-content-section-header">
              <h2 className="elite-content-section-title">Chief Complaint</h2>
            </header>

            <div className="elite-form-field">
              <label className="elite-form-field-label is-required">
                Primary Complaint
              </label>
              <textarea
                className="elite-form-field-input elite-form-field-textarea"
                placeholder="Describe the primary complaint..."
              />
              <span className="elite-form-field-hint">
                Be specific and detailed
              </span>
            </div>

            <div className="elite-form-grid-3">
              <div className="elite-form-field">
                <label className="elite-form-field-label">Severity</label>
                <select className="elite-form-field-input elite-form-field-select">
                  <option>Select severity...</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label">Onset Time</label>
                <input
                  type="time"
                  className="elite-form-field-input"
                />
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label">Duration</label>
                <input
                  type="text"
                  className="elite-form-field-input"
                  placeholder="e.g., 30 minutes"
                />
              </div>
            </div>
          </section>

          <section className="elite-content-section">
            <header className="elite-content-section-header">
              <h2 className="elite-content-section-title">Vital Signs</h2>
              <div className="elite-toggle-group">
                <button className="elite-toggle-item is-active">Manual</button>
                <button className="elite-toggle-item">Monitor</button>
              </div>
            </header>

            <div className="elite-form-grid-3">
              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  className="elite-form-field-input"
                  placeholder="120/80"
                />
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Heart Rate
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="bpm"
                />
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Respiratory Rate
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="breaths/min"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Quickbar */}
      <aside className="elite-quickbar">
        <button className="elite-quickbar-item is-active">
          <ClipboardIcon className="elite-quickbar-item-icon" />
        </button>
        <button className="elite-quickbar-item">
          <HistoryIcon className="elite-quickbar-item-icon" />
        </button>
        <div className="elite-quickbar-divider"></div>
        <button className="elite-quickbar-item">
          <SettingsIcon className="elite-quickbar-item-icon" />
        </button>
      </aside>

      {/* Status Bar */}
      <footer className="elite-statusbar">
        <div className="elite-statusbar-section">
          <div className="elite-statusbar-item">
            <span className="elite-statusbar-indicator"></span>
            <span>Connected to CAD</span>
          </div>
          <div className="elite-statusbar-divider"></div>
          <div className="elite-statusbar-item">
            <UserIcon className="elite-statusbar-icon" />
            <span>John Doe, EMT-P</span>
          </div>
        </div>

        <div className="elite-statusbar-section">
          <div className="elite-statusbar-item">
            <TruckIcon className="elite-statusbar-icon" />
            <span>Unit 51</span>
          </div>
          <div className="elite-statusbar-divider"></div>
          <div className="elite-statusbar-item">
            <span>Last saved: Just now</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

## Design Principles

1. **Medical-First**: Colors and layouts prioritize clinical workflows
2. **High Contrast**: WCAG AAA compliant for readability in all environments
3. **Responsive**: Works on tablets in ambulances and desktop at stations
4. **Consistent**: Unified design language across all components
5. **Accessible**: Keyboard navigation and screen reader friendly
6. **Professional**: Matches enterprise EMS software standards

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## Performance Considerations

- Uses CSS Grid and Flexbox (hardware accelerated)
- Minimal JavaScript required (CSS-only animations)
- CSS custom properties enable instant theming
- Optimized transitions (transform and opacity only)

## Customization

All design tokens can be customized by overriding CSS variables:

```css
:root {
  --elite-primary: #your-custom-red;
  --elite-sidebar-width: 280px;
  --elite-space-4: 1.25rem;
  /* etc. */
}
```

## Next Steps

1. Import the CSS into your application
2. Update your layout components to use the elite classes
3. Migrate existing forms to use elite-form-field components
4. Implement the 3-column grid layout
5. Test responsive behavior across devices
6. Customize design tokens to match your brand (if needed)

## Support

For questions or issues with the CSS system, refer to:
- CSS file: `/Users/tanner-osterkamp/Medic-Bot/app/elite-field-system.css`
- This guide: `/Users/tanner-osterkamp/Medic-Bot/ELITE-FIELD-INTEGRATION.md`
