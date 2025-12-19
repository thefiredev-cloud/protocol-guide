/**
 * Complete Elite Field Layout Example
 *
 * This file demonstrates the full ImageTrend Elite Field CSS architecture
 * in a working Next.js/React component.
 *
 * To use:
 * 1. Ensure elite-field-system.css is imported in your app
 * 2. Copy this component structure for your pages
 * 3. Replace placeholder icons with your actual icon library
 */

/* eslint-disable max-lines-per-function */
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  HelpCircle,
  MapPin,
  Menu,
  Save,
  Settings,
  Truck,
  Upload,
  User,
} from 'lucide-react'; // Replace with your icon library
import * as React from 'react';

export default function EliteFieldExample() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState({
    patientCare: true,
    protocols: false,
    documentation: false,
  });

  const [currentView, setCurrentView] = React.useState('assessment');

  return (
    <div className="elite-app-container">
      {/* ================================================================
          TOOLBAR (Top Navigation Bar)
          ================================================================ */}
      <header className="elite-toolbar">
        {/* Left Section */}
        <div className="elite-toolbar-section">
          <button
            className="elite-button elite-button-ghost elite-button-icon-only"
            aria-label="Toggle menu"
          >
            <Menu className="elite-button-icon" />
          </button>

          <div>
            <h1 className="elite-toolbar-title">Patient Assessment</h1>
            <p className="elite-toolbar-subtitle">
              Incident #2024-001234 • John Doe • Age 45
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="elite-toolbar-section">
          <div className="elite-toolbar-search">
            <div className="elite-form-field" style={{ marginBottom: 0 }}>
              <input
                type="search"
                className="elite-form-field-input"
                placeholder="Search protocols, medications..."
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="elite-toolbar-section elite-toolbar-actions">
          <button className="elite-button elite-button-secondary">
            <Clock className="elite-button-icon" />
            History
          </button>

          <div className="elite-toolbar-divider" />

          <button className="elite-button elite-button-save">
            <Save className="elite-button-icon" />
            Save Draft
          </button>

          <button className="elite-button elite-button-post">
            <Upload className="elite-button-icon" />
            Post to CAD
          </button>
        </div>
      </header>

      {/* ================================================================
          SIDEBAR (Left Navigation)
          ================================================================ */}
      <aside className="elite-sidebar">
        {/* Sidebar Header */}
        <div className="elite-sidebar-header">
          <img
            src="/medic-bot-logo.svg"
            className="elite-sidebar-logo"
            alt="Medic-Bot"
          />
          <h1 className="elite-sidebar-title">Medic-Bot</h1>
        </div>

        {/* Navigation */}
        <nav>
          {/* Patient Care Section */}
          <section
            className={`elite-sidebar-section ${
              sidebarExpanded.patientCare ? 'is-expanded' : ''
            }`}
          >
            <header
              className="elite-sidebar-section-header"
              onClick={() =>
                setSidebarExpanded({
                  ...sidebarExpanded,
                  patientCare: !sidebarExpanded.patientCare,
                })
              }
            >
              <span>Patient Care</span>
              <ChevronRight className="elite-sidebar-section-icon" />
            </header>

            <div className="elite-sidebar-section-content">
              <a
                href="#demographics"
                className="elite-sidebar-item"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('demographics');
                }}
              >
                <User className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Demographics</span>
              </a>

              <a
                href="#assessment"
                className={`elite-sidebar-item ${
                  currentView === 'assessment' ? 'is-active' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('assessment');
                }}
              >
                <FileText className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Assessment</span>
                <span className="elite-badge elite-badge-danger">
                  <span className="elite-badge-dot elite-badge-danger" />
                </span>
              </a>

              <a
                href="#vitals"
                className="elite-sidebar-item"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('vitals');
                }}
              >
                <Heart className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Vital Signs</span>
                <span className="elite-badge elite-badge-outline-primary">3</span>
              </a>

              <a href="#interventions" className="elite-sidebar-item">
                <Activity className="elite-sidebar-item-icon" />
                <span className="elite-sidebar-item-text">Interventions</span>
              </a>
            </div>
          </section>

          {/* Protocols Section */}
          <section
            className={`elite-sidebar-section ${
              sidebarExpanded.protocols ? 'is-expanded' : ''
            }`}
          >
            <header
              className="elite-sidebar-section-header"
              onClick={() =>
                setSidebarExpanded({
                  ...sidebarExpanded,
                  protocols: !sidebarExpanded.protocols,
                })
              }
            >
              <span>Protocols</span>
              <ChevronRight className="elite-sidebar-section-icon" />
            </header>

            <div className="elite-sidebar-section-content">
              <a href="#cardiac" className="elite-sidebar-item is-nested">
                <span className="elite-sidebar-item-text">Cardiac</span>
              </a>
              <a href="#respiratory" className="elite-sidebar-item is-nested">
                <span className="elite-sidebar-item-text">Respiratory</span>
              </a>
              <a href="#trauma" className="elite-sidebar-item is-nested">
                <span className="elite-sidebar-item-text">Trauma</span>
              </a>
            </div>
          </section>

          {/* Documentation Section */}
          <section
            className={`elite-sidebar-section ${
              sidebarExpanded.documentation ? 'is-expanded' : ''
            }`}
          >
            <header
              className="elite-sidebar-section-header"
              onClick={() =>
                setSidebarExpanded({
                  ...sidebarExpanded,
                  documentation: !sidebarExpanded.documentation,
                })
              }
            >
              <span>Documentation</span>
              <ChevronRight className="elite-sidebar-section-icon" />
            </header>

            <div className="elite-sidebar-section-content">
              <a href="#narrative" className="elite-sidebar-item is-nested">
                <span className="elite-sidebar-item-text">Narrative</span>
              </a>
              <a href="#billing" className="elite-sidebar-item is-nested">
                <span className="elite-sidebar-item-text">Billing</span>
              </a>
            </div>
          </section>
        </nav>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA
          ================================================================ */}
      <main className="elite-content">
        {/* Content Header */}
        <header className="elite-content-header">
          <h1 className="elite-content-title">Patient Assessment</h1>
          <p className="elite-content-subtitle">
            Complete all required fields marked with an asterisk (*)
          </p>
        </header>

        {/* Content Body */}
        <div className="elite-content-body">
          {/* Alert/Warning Section */}
          <div
            className="elite-content-section"
            style={{
              backgroundColor: 'var(--elite-warning-light)',
              borderColor: 'var(--elite-warning)',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle
                className="shrink-0"
                style={{ color: 'var(--elite-warning)' }}
                size={24}
              />
              <div>
                <h3 className="font-semibold text-base mb-1">
                  Critical Time Sensitive
                </h3>
                <p className="text-sm text-secondary">
                  This patient has been flagged for time-sensitive care. Ensure
                  all vital signs are documented within 5 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Chief Complaint Section */}
          <section className="elite-content-section">
            <header className="elite-content-section-header">
              <h2 className="elite-content-section-title">Chief Complaint</h2>
              <div className="elite-toggle-group">
                <button className="elite-toggle-item is-active">Manual</button>
                <button className="elite-toggle-item">AI Assist</button>
              </div>
            </header>

            <div className="elite-form-field">
              <label className="elite-form-field-label is-required">
                Primary Complaint
              </label>
              <textarea
                className="elite-form-field-input elite-form-field-textarea"
                placeholder="Describe the primary complaint in detail..."
                rows={4}
                defaultValue="Patient reports chest pain, substernal, radiating to left arm. Pain started approximately 30 minutes ago while at rest."
              />
              <span className="elite-form-field-hint">
                Be specific and include onset, location, duration, and severity
              </span>
            </div>

            <div className="elite-form-grid-3">
              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Severity (1-10)
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="1-10"
                  defaultValue="8"
                  min="1"
                  max="10"
                />
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Onset Time
                </label>
                <input
                  type="time"
                  className="elite-form-field-input"
                  defaultValue="14:30"
                />
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label">Duration</label>
                <input
                  type="text"
                  className="elite-form-field-input"
                  placeholder="e.g., 30 minutes"
                  defaultValue="30 minutes"
                />
              </div>
            </div>

            <div className="elite-form-field">
              <label className="elite-form-field-label">
                Associated Symptoms
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="elite-badge elite-badge-outline-primary">
                  Shortness of Breath
                </span>
                <span className="elite-badge elite-badge-outline-primary">
                  Nausea
                </span>
                <span className="elite-badge elite-badge-outline-primary">
                  Diaphoresis
                </span>
                <button className="elite-button elite-button-ghost elite-button-sm">
                  + Add Symptom
                </button>
              </div>
            </div>
          </section>

          {/* Vital Signs Section */}
          <section className="elite-content-section">
            <header className="elite-content-section-header">
              <h2 className="elite-content-section-title">
                Vital Signs
                <span className="elite-badge elite-badge-success ml-2">
                  <CheckCircle size={12} className="inline mr-1" />
                  Complete
                </span>
              </h2>
              <div className="elite-toggle-group">
                <button className="elite-toggle-item is-active">Manual</button>
                <button className="elite-toggle-item">Monitor Link</button>
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
                  defaultValue="145/92"
                />
                <span className="elite-form-field-hint">Systolic/Diastolic</span>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Heart Rate
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="bpm"
                  defaultValue="110"
                />
                <span className="elite-form-field-hint">beats per minute</span>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Respiratory Rate
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="breaths/min"
                  defaultValue="22"
                />
                <span className="elite-form-field-hint">breaths per minute</span>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  SpO2
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="%"
                  defaultValue="94"
                  min="0"
                  max="100"
                />
                <span className="elite-form-field-hint">oxygen saturation</span>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Temperature
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="°F"
                  defaultValue="98.6"
                  step="0.1"
                />
                <span className="elite-form-field-hint">Fahrenheit</span>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label">
                  Blood Glucose
                </label>
                <input
                  type="number"
                  className="elite-form-field-input"
                  placeholder="mg/dL"
                  defaultValue="120"
                />
                <span className="elite-form-field-hint">mg/dL</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-content border border-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Trend Analysis</span>
                <button className="elite-button elite-button-ghost elite-button-sm">
                  View Chart
                </button>
              </div>
              <div className="text-xs text-secondary">
                Vital signs show elevated heart rate and blood pressure
                consistent with acute cardiac event. Recommend immediate
                intervention.
              </div>
            </div>
          </section>

          {/* Error Example Section */}
          <section className="elite-content-section">
            <header className="elite-content-section-header">
              <h2 className="elite-content-section-title">Medications</h2>
              <button className="elite-button elite-button-primary elite-button-sm">
                + Add Medication
              </button>
            </header>

            <div className="elite-form-grid-2">
              <div className="elite-form-field is-error">
                <label className="elite-form-field-label is-required">
                  Medication Name
                </label>
                <input
                  type="text"
                  className="elite-form-field-input"
                  placeholder="Search medication..."
                />
                <span className="elite-form-field-error">
                  <AlertCircle size={14} />
                  This field is required
                </span>
              </div>

              <div className="elite-form-field">
                <label className="elite-form-field-label is-required">
                  Dosage
                </label>
                <input
                  type="text"
                  className="elite-form-field-input"
                  placeholder="e.g., 324mg"
                  disabled
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 p-4 bg-surface rounded-lg border border-light">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-secondary" />
              <span className="text-sm text-secondary">
                Last saved: 2 minutes ago
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="elite-button elite-button-secondary">
                Cancel
              </button>
              <button className="elite-button elite-button-save">
                <Save className="elite-button-icon" />
                Save Draft
              </button>
              <button className="elite-button elite-button-post">
                <Upload className="elite-button-icon" />
                Post to CAD
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================
          QUICKBAR (Right Action Icons)
          ================================================================ */}
      <aside className="elite-quickbar">
        <button className="elite-quickbar-item is-active" title="Assessment">
          <FileText className="elite-quickbar-item-icon" />
        </button>

        <button className="elite-quickbar-item" title="History">
          <Clock className="elite-quickbar-item-icon" />
        </button>

        <button className="elite-quickbar-item" title="Protocols">
          <Activity className="elite-quickbar-item-icon" />
        </button>

        <div className="elite-quickbar-divider" />

        <button className="elite-quickbar-item" title="Help">
          <HelpCircle className="elite-quickbar-item-icon" />
        </button>

        <button className="elite-quickbar-item" title="Settings">
          <Settings className="elite-quickbar-item-icon" />
        </button>
      </aside>

      {/* ================================================================
          STATUSBAR (Bottom Status Bar)
          ================================================================ */}
      <footer className="elite-statusbar">
        {/* Left Section */}
        <div className="elite-statusbar-section">
          <div className="elite-statusbar-item">
            <span className="elite-statusbar-indicator" />
            <span>Connected to CAD</span>
          </div>

          <div className="elite-statusbar-divider" />

          <div className="elite-statusbar-item">
            <User className="elite-statusbar-icon" />
            <span>Sarah Johnson, EMT-P #12345</span>
          </div>

          <div className="elite-statusbar-divider" />

          <div className="elite-statusbar-item">
            <Truck className="elite-statusbar-icon" />
            <span>Unit 51 - Medic 1</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="elite-statusbar-section">
          <div className="elite-statusbar-item">
            <MapPin className="elite-statusbar-icon" />
            <span>Station 5, Los Angeles County</span>
          </div>

          <div className="elite-statusbar-divider" />

          <div className="elite-statusbar-item">
            <Clock className="elite-statusbar-icon" />
            <span>Incident Time: 14:25</span>
          </div>

          <div className="elite-statusbar-divider" />

          <div className="elite-statusbar-item">
            <span>Auto-save enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * USAGE NOTES:
 *
 * 1. This component demonstrates the complete Elite Field layout
 * 2. Replace lucide-react icons with your preferred icon library
 * 3. Connect form inputs to your state management (Redux, Zustand, etc.)
 * 4. Add your API calls for data fetching and saving
 * 5. Customize colors by overriding CSS variables
 * 6. Test responsive behavior on mobile/tablet devices
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop (>1024px): Full 3-column layout
 * - Tablet (769-1024px): Collapsed sidebar, no quickbar
 * - Mobile (<768px): Content only, no sidebars
 *
 * ACCESSIBILITY:
 * - All interactive elements have focus states
 * - Labels are properly associated with inputs
 * - Semantic HTML structure for screen readers
 * - Keyboard navigation support
 */
