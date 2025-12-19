# Elite Field CSS Quick Reference Cheat Sheet

## Core Layout

```tsx
<div className="elite-app-container">              // Main 3-column grid
<div className="elite-app-container sidebar-collapsed">  // Collapsed sidebar
```

## Components

### Sidebar
```tsx
<aside className="elite-sidebar">                  // Left navigation
<div className="elite-sidebar-header">             // Top of sidebar
<h1 className="elite-sidebar-title">               // Sidebar title
<section className="elite-sidebar-section">        // Accordion section
<section className="elite-sidebar-section is-expanded">  // Expanded section
<header className="elite-sidebar-section-header">  // Section header
<div className="elite-sidebar-section-content">    // Section body
<a className="elite-sidebar-item">                 // Nav item
<a className="elite-sidebar-item is-active">       // Active nav item
<a className="elite-sidebar-item is-nested">       // Nested nav item
```

### Toolbar
```tsx
<header className="elite-toolbar">                 // Top bar
<div className="elite-toolbar-section">            // Toolbar section
<h1 className="elite-toolbar-title">               // Main title
<p className="elite-toolbar-subtitle">             // Subtitle
<div className="elite-toolbar-divider">            // Vertical divider
<div className="elite-toolbar-actions">            // Button group
```

### Content
```tsx
<main className="elite-content">                   // Main content area
<header className="elite-content-header">          // Page header
<h1 className="elite-content-title">               // Page title
<p className="elite-content-subtitle">             // Page subtitle
<div className="elite-content-body">               // Content wrapper
<section className="elite-content-section">        // White card
<header className="elite-content-section-header">  // Card header
<h2 className="elite-content-section-title">       // Card title
```

### Quickbar
```tsx
<aside className="elite-quickbar">                 // Right sidebar
<button className="elite-quickbar-item">           // Icon button
<button className="elite-quickbar-item is-active"> // Active button
<div className="elite-quickbar-divider">           // Horizontal divider
```

### Status Bar
```tsx
<footer className="elite-statusbar">               // Bottom bar
<div className="elite-statusbar-section">          // Status section
<div className="elite-statusbar-item">             // Status item
<div className="elite-statusbar-divider">          // Vertical divider
<span className="elite-statusbar-indicator">       // Status dot (green)
<span className="elite-statusbar-indicator is-error">    // Red dot
<span className="elite-statusbar-indicator is-warning">  // Yellow dot
```

## Forms

### Form Fields
```tsx
<div className="elite-form-field">                 // Field wrapper
<div className="elite-form-field is-error">        // Error state
<label className="elite-form-field-label">         // Label
<label className="elite-form-field-label is-required">  // Required label (*)
<input className="elite-form-field-input">         // Input
<textarea className="elite-form-field-input elite-form-field-textarea">
<select className="elite-form-field-input elite-form-field-select">
<span className="elite-form-field-hint">           // Help text
<span className="elite-form-field-error">          // Error message
```

### Form Grids
```tsx
<div className="elite-form-grid">                  // Auto-fit grid
<div className="elite-form-grid-2">                // 2-column grid
<div className="elite-form-grid-3">                // 3-column grid
```

## Buttons

### Variants
```tsx
<button className="elite-button elite-button-primary">   // Blue button
<button className="elite-button elite-button-save">      // Blue save button
<button className="elite-button elite-button-post">      // Red emergency button
<button className="elite-button elite-button-danger">    // Red danger button
<button className="elite-button elite-button-secondary"> // White outline button
<button className="elite-button elite-button-ghost">     // Transparent button
```

### Sizes
```tsx
<button className="elite-button elite-button-sm">        // Small
<button className="elite-button">                        // Default
<button className="elite-button elite-button-lg">        // Large
<button className="elite-button elite-button-xl">        // Extra large
<button className="elite-button elite-button-icon-only"> // Icon only
<button className="elite-button elite-button-block">     // Full width
```

### With Icons
```tsx
<button className="elite-button elite-button-primary">
  <svg className="elite-button-icon">...</svg>
  Button Text
</button>
```

## Badges

```tsx
<span className="elite-badge elite-badge-default">       // Gray
<span className="elite-badge elite-badge-primary">       // Red
<span className="elite-badge elite-badge-secondary">     // Blue
<span className="elite-badge elite-badge-success">       // Green
<span className="elite-badge elite-badge-warning">       // Yellow
<span className="elite-badge elite-badge-danger">        // Red
<span className="elite-badge elite-badge-info">          // Cyan

<span className="elite-badge elite-badge-outline-primary">   // Outlined variants
<span className="elite-badge elite-badge-outline-success">
<span className="elite-badge elite-badge-outline-warning">
<span className="elite-badge elite-badge-outline-danger">

<span className="elite-badge elite-badge-dot elite-badge-danger">  // Notification dot
```

## Toggle Group

```tsx
<div className="elite-toggle-group">
  <button className="elite-toggle-item is-active">View</button>
  <button className="elite-toggle-item">Edit</button>
</div>
```

## State Classes

```tsx
.is-active          // Selected/current state
.is-expanded        // Accordion opened
.is-required        // Required field
.is-error           // Error state
.is-disabled        // Disabled state
.is-loading         // Loading state (with spinner)
.is-hidden          // Hidden
.is-collapsed       // Collapsed
.is-focused         // Focused state
```

## Text Utilities

### Size
```tsx
.text-xs            // 12px
.text-sm            // 14px
.text-base          // 16px
.text-lg            // 18px
.text-xl            // 20px
.text-2xl           // 24px
.text-3xl           // 30px
```

### Weight
```tsx
.font-normal        // 400
.font-medium        // 500
.font-semibold      // 600
.font-bold          // 700
```

### Alignment
```tsx
.text-left
.text-center
.text-right
```

### Color
```tsx
.text-primary       // Dark gray
.text-secondary     // Medium gray
.text-tertiary      // Light gray
.text-muted         // Very light gray
.text-inverse       // White
.text-success       // Green
.text-warning       // Yellow
.text-danger        // Red
.text-info          // Cyan
```

### Transform
```tsx
.uppercase
.lowercase
.capitalize
.truncate           // Ellipsis overflow
```

## Spacing Utilities

### Margin
```tsx
.m-0 .m-1 .m-2 .m-3 .m-4 .m-5 .m-6 .m-8
.mt-0 .mt-1 .mt-2 .mt-3 .mt-4 .mt-6
.mb-0 .mb-1 .mb-2 .mb-3 .mb-4 .mb-6
.ml-0 .ml-1 .ml-2 .ml-3 .ml-4 .ml-auto
.mr-0 .mr-1 .mr-2 .mr-3 .mr-4 .mr-auto
.mx-auto            // Center horizontally
```

### Padding
```tsx
.p-0 .p-1 .p-2 .p-3 .p-4 .p-5 .p-6 .p-8
.pt-0 .pt-1 .pt-2 .pt-3 .pt-4 .pt-6
.pb-0 .pb-1 .pb-2 .pb-3 .pb-4 .pb-6
.pl-0 .pl-1 .pl-2 .pl-3 .pl-4
.pr-0 .pr-1 .pr-2 .pr-3 .pr-4
```

### Gap
```tsx
.gap-0 .gap-1 .gap-2 .gap-3 .gap-4 .gap-6 .gap-8
```

## Display Utilities

```tsx
.block
.inline-block
.inline
.flex
.inline-flex
.grid
.inline-grid
.hidden
```

## Flexbox Utilities

```tsx
.flex-row           // Horizontal
.flex-col           // Vertical
.flex-wrap
.flex-nowrap

.items-start
.items-center
.items-end
.items-stretch

.justify-start
.justify-center
.justify-end
.justify-between
.justify-around

.flex-1             // Grow to fill
.flex-auto
.flex-none
.shrink-0           // Don't shrink
.grow-0             // Don't grow
```

## Grid Utilities

```tsx
.grid-cols-1
.grid-cols-2
.grid-cols-3
.grid-cols-4
```

## Position

```tsx
.relative
.absolute
.fixed
.sticky
```

## Size

```tsx
.w-full             // Width 100%
.h-full             // Height 100%
.w-auto
.h-auto
```

## Overflow

```tsx
.overflow-auto
.overflow-hidden
.overflow-scroll
.overflow-x-auto
.overflow-y-auto
```

## Border Utilities

```tsx
.border             // 1px all sides
.border-0           // No border
.border-t           // Top only
.border-b           // Bottom only
.border-l           // Left only
.border-r           // Right only

.rounded-none       // 0
.rounded-sm         // 2px
.rounded            // 4px
.rounded-md         // 6px
.rounded-lg         // 8px
.rounded-xl         // 12px
.rounded-full       // Circle/pill
```

## Shadow Utilities

```tsx
.shadow-none
.shadow-xs
.shadow-sm
.shadow             // Base
.shadow-md
.shadow-lg
.shadow-xl
```

## Background Utilities

```tsx
.bg-transparent
.bg-surface         // White
.bg-content         // Light gray
.bg-primary         // Red
.bg-secondary       // Blue
.bg-success         // Green
.bg-warning         // Yellow
.bg-danger          // Red
```

## Cursor Utilities

```tsx
.cursor-pointer
.cursor-not-allowed
.cursor-default
```

## Interaction Utilities

```tsx
.select-none        // No text selection
.select-text
.select-all

.pointer-events-none
.pointer-events-auto
```

## Responsive Utilities

```tsx
.hidden             // Always hidden
.sm\:hidden         // Hidden on small+
.md\:hidden         // Hidden on medium+
.lg\:hidden         // Hidden on large+

.sm\:block          // Block on small+
.md\:flex           // Flex on medium+
.lg\:grid           // Grid on large+

// Breakpoints:
// sm: 640px+
// md: 768px+
// lg: 1024px+
// xl: 1280px+
```

## Animation Utilities

```tsx
.transition-all
.transition-fast    // 150ms
.transition-base    // 200ms
.transition-slow    // 300ms

.animate-fade-in
.animate-slide-in-right
.animate-slide-in-left
.animate-scale-in
```

## CSS Variables (Design Tokens)

### Colors
```css
--elite-sidebar-bg: #1a2332
--elite-primary: #c41e3a          /* Emergency red */
--elite-secondary: #2c5aa0        /* Medical blue */
--elite-content-bg: #f5f7fa
--elite-content-surface: #ffffff

--elite-success: #28a745
--elite-warning: #ffc107
--elite-danger: #dc3545
--elite-info: #17a2b8

--elite-text-primary: #2c3e50
--elite-text-secondary: #6c757d
--elite-text-muted: #adb5bd
--elite-text-inverse: #ffffff
```

### Spacing (4px base)
```css
--elite-space-1: 0.25rem    /* 4px */
--elite-space-2: 0.5rem     /* 8px */
--elite-space-3: 0.75rem    /* 12px */
--elite-space-4: 1rem       /* 16px */
--elite-space-5: 1.25rem    /* 20px */
--elite-space-6: 1.5rem     /* 24px */
--elite-space-8: 2rem       /* 32px */
```

### Typography
```css
--elite-text-xs: 0.75rem    /* 12px */
--elite-text-sm: 0.875rem   /* 14px */
--elite-text-base: 1rem     /* 16px */
--elite-text-lg: 1.125rem   /* 18px */
--elite-text-xl: 1.25rem    /* 20px */

--elite-font-normal: 400
--elite-font-medium: 500
--elite-font-semibold: 600
--elite-font-bold: 700
```

### Layout
```css
--elite-sidebar-width: 260px
--elite-sidebar-collapsed-width: 60px
--elite-toolbar-height: 56px
--elite-statusbar-height: 32px
--elite-quickbar-width: 60px
```

## Common Patterns

### Card with Header
```tsx
<section className="elite-content-section">
  <header className="elite-content-section-header">
    <h2 className="elite-content-section-title">Title</h2>
    <button className="elite-button elite-button-secondary">Action</button>
  </header>
  <div>Content</div>
</section>
```

### Form Row
```tsx
<div className="elite-form-grid-2">
  <div className="elite-form-field">
    <label className="elite-form-field-label">Label</label>
    <input className="elite-form-field-input" />
  </div>
  <div className="elite-form-field">
    <label className="elite-form-field-label">Label</label>
    <input className="elite-form-field-input" />
  </div>
</div>
```

### Button Group
```tsx
<div className="flex items-center gap-2">
  <button className="elite-button elite-button-secondary">Cancel</button>
  <button className="elite-button elite-button-primary">Save</button>
</div>
```

### Status Indicator
```tsx
<div className="flex items-center gap-2">
  <span className="elite-statusbar-indicator"></span>
  <span className="text-sm">Online</span>
</div>
```

### Badge on Item
```tsx
<div className="flex items-center justify-between">
  <span>Item Name</span>
  <span className="elite-badge elite-badge-danger">5</span>
</div>
```
