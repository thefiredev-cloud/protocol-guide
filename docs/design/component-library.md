# EMS Component Library - Implementation Guide
**Ready-to-use components for LA County Fire Medic Bot**

## Quick Reference Component Patterns

### Emergency Alert Components

#### 1. Critical Alert (P1 - Immediate Action Required)

```jsx
// CriticalAlert.tsx
interface CriticalAlertProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function CriticalAlert({
  title,
  message,
  actionLabel = 'Acknowledge',
  onAction,
  onDismiss
}: CriticalAlertProps) {
  return (
    <div
      className="alert alert-critical"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="alert-icon">
        <AlertTriangle size={24} strokeWidth={2.5} />
      </div>
      <div className="alert-content">
        <h3 className="alert-title">{title}</h3>
        <p className="alert-message">{message}</p>
      </div>
      <div className="alert-actions">
        {onAction && (
          <button
            type="button"
            className="btn-critical"
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
```

```css
/* Critical Alert Styling */
.alert-critical {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--critical-red-bg);
  border: 2px solid var(--critical-red);
  border-left: 6px solid var(--critical-red);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(255, 69, 58, 0.3);
  animation: alertSlideIn 0.3s ease-out;
}

.alert-icon {
  flex-shrink: 0;
  color: var(--critical-red);
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.alert-message {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
}

.alert-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

@keyframes alertSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Sunlight mode - Maximum visibility */
[data-theme='sunlight'] .alert-critical {
  border-width: 4px;
  font-weight: 700;
  box-shadow: 0 0 0 4px rgba(204, 0, 0, 0.2);
}
```

#### 2. Base Contact Alert (Hospital Communication)

```jsx
// BaseContactAlert.tsx
interface BaseContactAlertProps {
  hospitalName: string;
  contactNumber: string;
  reason: string;
  priority: 'routine' | 'urgent' | 'emergent';
  onCall?: () => void;
}

export function BaseContactAlert({
  hospitalName,
  contactNumber,
  reason,
  priority,
  onCall
}: BaseContactAlertProps) {
  const priorityStyles = {
    routine: 'alert-info',
    urgent: 'alert-warning',
    emergent: 'alert-critical'
  };

  const priorityLabels = {
    routine: 'Routine Contact',
    urgent: 'Urgent - Base Contact Required',
    emergent: 'EMERGENT - Immediate Base Contact'
  };

  return (
    <div
      className={`alert ${priorityStyles[priority]}`}
      role="alert"
      aria-live={priority === 'emergent' ? 'assertive' : 'polite'}
    >
      <div className="alert-icon">
        <Phone size={24} strokeWidth={2.5} />
      </div>
      <div className="alert-content">
        <div className="alert-badge">
          {priorityLabels[priority]}
        </div>
        <h3 className="alert-title">{hospitalName}</h3>
        <p className="alert-message">{reason}</p>
        <a
          href={`tel:${contactNumber}`}
          className="contact-number"
          onClick={onCall}
        >
          {contactNumber}
        </a>
      </div>
      {onCall && (
        <button
          type="button"
          className="btn-critical btn-call"
          onClick={onCall}
          aria-label={`Call ${hospitalName}`}
        >
          <Phone size={20} />
          Call Now
        </button>
      )}
    </div>
  );
}
```

```css
.alert-badge {
  display: inline-block;
  padding: 4px 10px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
  background: currentColor;
  color: #ffffff;
}

.contact-number {
  display: inline-block;
  margin-top: 8px;
  font-size: 20px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent);
  text-decoration: none;
  padding: 8px 12px;
  background: var(--accent-light);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.contact-number:hover {
  background: var(--hover);
}

.btn-call {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 0 24px;
  white-space: nowrap;
}
```

### Protocol Display Components

#### 3. Protocol Card (Quick Access)

```jsx
// ProtocolCard.tsx
interface ProtocolCardProps {
  protocolId: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  category: string;
  onSelect: (protocolId: string) => void;
}

export function ProtocolCard({
  protocolId,
  title,
  description,
  priority,
  category,
  onSelect
}: ProtocolCardProps) {
  const priorityColors = {
    1: 'critical',
    2: 'high',
    3: 'medium'
  };

  const priorityLabels = {
    1: 'P1 - CRITICAL',
    2: 'P2 - HIGH',
    3: 'P3 - STANDARD'
  };

  return (
    <button
      type="button"
      className="protocol-card ripple"
      onClick={() => onSelect(protocolId)}
      aria-label={`Open protocol ${protocolId}: ${title}`}
    >
      <div className="protocol-header">
        <span className={`protocol-badge protocol-badge-${priorityColors[priority]}`}>
          {protocolId}
        </span>
        <span className={`protocol-urgency-badge urgency-${priorityColors[priority]}`}>
          {priorityLabels[priority]}
        </span>
      </div>
      <h3 className="protocol-title">{title}</h3>
      <p className="protocol-description">{description}</p>
      <div className="protocol-footer">
        <span className="protocol-category">{category}</span>
        <ChevronRight size={20} className="protocol-arrow" />
      </div>
    </button>
  );
}
```

```css
.protocol-card {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.protocol-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: var(--accent);
}

.protocol-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.protocol-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.protocol-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}

.protocol-badge-critical {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.protocol-badge-high {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.protocol-badge-medium {
  background: rgba(255, 214, 10, 0.15);
  color: #ffd60a;
  border: 1px solid rgba(255, 214, 10, 0.3);
}

.protocol-urgency-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.urgency-critical {
  background: #ff3b30;
  color: #ffffff;
}

.urgency-high {
  background: #ff9500;
  color: #ffffff;
}

.urgency-medium {
  background: #ffd60a;
  color: #000000;
}

.protocol-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.protocol-description {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.protocol-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.protocol-category {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.protocol-arrow {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.protocol-card:hover .protocol-arrow {
  transform: translateX(4px);
}

/* iPad Grid Layout */
@media (min-width: 768px) and (orientation: portrait) {
  .protocol-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 768px) and (orientation: landscape) {
  .protocol-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}
```

### Medication Dosing Components

#### 4. Weight-Based Dosing Calculator

```jsx
// WeightBasedDosing.tsx
interface DosingCalculatorProps {
  medicationName: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  dosePerKg: number;
  maxDose?: number;
  route: string;
  concentration: string;
}

export function WeightBasedDosing({
  medicationName,
  weight,
  weightUnit,
  dosePerKg,
  maxDose,
  route,
  concentration
}: DosingCalculatorProps) {
  const weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
  const calculatedDose = weightInKg * dosePerKg;
  const finalDose = maxDose ? Math.min(calculatedDose, maxDose) : calculatedDose;

  return (
    <div className="dosing-card">
      <div className="dosing-header">
        <h3 className="dosing-medication">{medicationName}</h3>
        <span className="dosing-route">{route}</span>
      </div>

      <div className="dosing-input">
        <label htmlFor="weight-input">Patient Weight</label>
        <div className="input-with-unit">
          <input
            id="weight-input"
            type="number"
            value={weight}
            className="dosing-weight-input"
            aria-label="Patient weight"
          />
          <span className="input-unit">{weightUnit}</span>
        </div>
      </div>

      <div className="dosing-calculation">
        <div className="calculation-row">
          <span className="calculation-label">Dose per kg:</span>
          <span className="calculation-value monospace">{dosePerKg} mg/kg</span>
        </div>
        <div className="calculation-row">
          <span className="calculation-label">Weight in kg:</span>
          <span className="calculation-value monospace">{weightInKg.toFixed(1)} kg</span>
        </div>
        {maxDose && (
          <div className="calculation-row">
            <span className="calculation-label">Maximum dose:</span>
            <span className="calculation-value monospace">{maxDose} mg</span>
          </div>
        )}
      </div>

      <div className="dosing-result">
        <div className="result-label">Calculated Dose</div>
        <div className="result-value monospace">{finalDose.toFixed(2)} mg</div>
        <div className="result-concentration">{concentration}</div>
      </div>

      {maxDose && calculatedDose > maxDose && (
        <div className="dosing-warning">
          <AlertTriangle size={16} />
          <span>Dose capped at maximum {maxDose} mg</span>
        </div>
      )}
    </div>
  );
}
```

```css
.dosing-card {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
}

.dosing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.dosing-medication {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.dosing-route {
  padding: 6px 12px;
  background: var(--info-blue-bg);
  color: var(--info-blue);
  border: 1px solid var(--info-blue-border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.dosing-input {
  margin-bottom: 20px;
}

.dosing-input label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dosing-weight-input {
  flex: 1;
  min-height: 52px;
  padding: 12px 16px;
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.dosing-weight-input:focus {
  border-color: var(--focus);
  outline: none;
  box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.1);
}

.input-unit {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 40px;
}

.dosing-calculation {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--background);
  border-radius: 12px;
}

.calculation-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.calculation-row + .calculation-row {
  border-top: 1px solid var(--border-subtle);
}

.calculation-label {
  font-size: 15px;
  color: var(--text-secondary);
}

.calculation-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.dosing-result {
  padding: 20px;
  background: var(--accent-light);
  border: 2px solid var(--accent);
  border-radius: 12px;
  text-align: center;
}

.result-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 4px;
}

.result-concentration {
  font-size: 14px;
  color: var(--text-secondary);
}

.dosing-warning {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--warning-amber-bg);
  border: 1px solid var(--warning-amber-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.dosing-warning svg {
  color: var(--warning-amber);
  flex-shrink: 0;
}
```

### Status and Feedback Components

#### 5. Connection Status Indicator

```jsx
// ConnectionStatus.tsx
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: Date;
}

export function ConnectionStatus({
  isOnline,
  isSyncing,
  lastSync
}: ConnectionStatusProps) {
  if (isOnline && !isSyncing) {
    return (
      <div className="connection-status status-online" role="status">
        <Wifi size={16} />
        <span>Online</span>
        {lastSync && (
          <span className="last-sync">
            Synced {formatTimeAgo(lastSync)}
          </span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="connection-status status-syncing" role="status">
        <RefreshCw size={16} className="icon-spinning" />
        <span>Syncing...</span>
      </div>
    );
  }

  return (
    <div className="connection-status status-offline" role="alert">
      <WifiOff size={16} />
      <span>Offline</span>
      {lastSync && (
        <span className="last-sync">
          Last synced {formatTimeAgo(lastSync)}
        </span>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
```

```css
.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
}

.connection-status svg {
  flex-shrink: 0;
}

.status-online {
  color: var(--success);
  border-color: var(--success-green-border);
}

.status-offline {
  color: var(--error);
  border-color: var(--critical-red-border);
  background: var(--critical-red-bg);
}

.status-syncing {
  color: var(--info);
  border-color: var(--info-blue-border);
}

.icon-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.last-sync {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.8;
}
```

#### 6. Toast Notifications

```jsx
// Toast.tsx
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({
  type,
  title,
  message,
  duration = 5000,
  onDismiss
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div
      className={`toast toast-${type}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}
```

```css
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-left: 4px solid;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  animation: toastSlideIn 0.3s ease-out;
}

.toast-success {
  border-left-color: var(--success);
}

.toast-warning {
  border-left-color: var(--warning);
}

.toast-error {
  border-left-color: var(--error);
}

.toast-info {
  border-left-color: var(--info);
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-success .toast-icon { color: var(--success); }
.toast-warning .toast-icon { color: var(--warning); }
.toast-error .toast-icon { color: var(--error); }
.toast-info .toast-icon { color: var(--info); }

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.toast-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease, color 0.2s ease;
}

.toast-close:hover {
  background: var(--hover);
  color: var(--text-primary);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Toast container - Fixed position */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-container .toast {
  pointer-events: all;
}

/* Mobile - Full width */
@media (max-width: 767px) {
  .toast-container {
    left: 16px;
    right: 16px;
    top: 16px;
  }

  .toast {
    max-width: none;
  }
}
```

### Navigation Components

#### 7. Quick Action Floating Button (FAB)

```jsx
// QuickActionButton.tsx
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface QuickAction {
  id: string;
  icon: React.ComponentType;
  label: string;
  onClick: () => void;
}

interface QuickActionButtonProps {
  actions: QuickAction[];
}

export function QuickActionButton({ actions }: QuickActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="quick-action-fab">
      {isOpen && (
        <div className="fab-actions">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="fab-action-button"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                aria-label={action.label}
              >
                <Icon size={20} />
                <span className="fab-action-label">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className={`fab-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
```

```css
.quick-action-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.fab-trigger {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.fab-trigger:active {
  transform: scale(0.95);
}

.fab-trigger.active {
  transform: rotate(135deg);
}

.fab-actions {
  position: absolute;
  bottom: 80px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fabExpand 0.3s ease-out;
}

.fab-action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 20px;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 26px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.fab-action-button:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.fab-action-label {
  margin-right: 4px;
}

@keyframes fabExpand {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* iPad safe areas */
@media (min-width: 768px) {
  .quick-action-fab {
    bottom: calc(24px + env(safe-area-inset-bottom));
    right: calc(24px + env(safe-area-inset-right));
  }
}
```

### Form Components

#### 8. Search Bar with Voice Input

```jsx
// SearchBar.tsx
import { Search, X, Mic } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: () => void;
  isListening?: boolean;
}

export function SearchBar({
  placeholder = 'Search protocols, medications...',
  value,
  onChange,
  onSearch,
  voiceEnabled = false,
  onVoiceToggle,
  isListening = false
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <div className="search-icon">
        <Search size={20} />
      </div>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        aria-label="Search"
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
      {voiceEnabled && (
        <button
          type="button"
          className={`search-voice ${isListening ? 'listening' : ''}`}
          onClick={onVoiceToggle}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          <Mic size={20} />
        </button>
      )}
    </div>
  );
}
```

```css
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 600px;
  min-height: 52px;
  padding: 0 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 26px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-bar:focus-within {
  border-color: var(--focus);
  box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.1);
}

.search-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 48px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 17px;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear,
.search-voice {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.search-clear:hover,
.search-voice:hover {
  background: var(--hover);
  color: var(--text-primary);
}

.search-voice.listening {
  color: var(--accent);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
```

## Usage Examples

### Complete Page Layout

```jsx
// ProtocolsPage.tsx
export function ProtocolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const protocols = [
    {
      id: '800',
      title: 'Cardiac Arrest',
      description: 'Adult cardiac arrest management and resuscitation',
      priority: 1,
      category: 'Cardiac'
    },
    // ... more protocols
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">LA County Protocols</h1>
        <ConnectionStatus
          isOnline={true}
          isSyncing={false}
          lastSync={new Date()}
        />
      </header>

      <div className="search-container">
        <SearchBar
          placeholder="Search protocols, medications, procedures..."
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => console.log('Search:', searchQuery)}
          voiceEnabled={true}
          onVoiceToggle={() => setIsListening(!isListening)}
          isListening={isListening}
        />
      </div>

      <div className="protocol-grid">
        {protocols.map((protocol) => (
          <ProtocolCard
            key={protocol.id}
            {...protocol}
            onSelect={setSelectedProtocol}
          />
        ))}
      </div>

      <QuickActionButton
        actions={[
          {
            id: 'call-base',
            icon: Phone,
            label: 'Call Base Hospital',
            onClick: () => console.log('Call base')
          },
          {
            id: 'vitals',
            icon: Activity,
            label: 'Log Vitals',
            onClick: () => console.log('Log vitals')
          },
          {
            id: 'narrative',
            icon: FileText,
            label: 'Build Narrative',
            onClick: () => console.log('Build narrative')
          }
        ]}
      />
    </div>
  );
}
```

```css
.page-container {
  min-height: 100vh;
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.search-container {
  margin-bottom: 32px;
}

/* iPad Portrait */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .page-container {
    padding: 32px;
  }

  .page-title {
    font-size: 36px;
  }
}

/* iPad Landscape */
@media (min-width: 768px) and (orientation: landscape) {
  .page-container {
    padding: 40px;
  }

  .page-title {
    font-size: 40px;
  }
}
```

---

## Best Practices

### 1. Always Include ARIA Labels
```jsx
// Good
<button aria-label="Send message" onClick={sendMessage}>
  <Send size={20} />
</button>

// Bad
<button onClick={sendMessage}>
  <Send size={20} />
</button>
```

### 2. Use Semantic HTML
```jsx
// Good
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/protocols">Protocols</a></li>
  </ul>
</nav>

// Bad
<div className="nav">
  <div onClick={() => navigate('/protocols')}>Protocols</div>
</div>
```

### 3. Provide Visual Feedback
```jsx
// Always show loading states
{isLoading && <Spinner />}

// Always show success/error feedback
{error && <Toast type="error" title="Error" message={error} />}
{success && <Toast type="success" title="Success" message="Saved" />}
```

### 4. Test with Gloves
- All buttons 52px+ minimum
- Adequate spacing (12px+ gap)
- Clear hover/active states
- No tiny touch targets

### 5. Support Keyboard Navigation
```jsx
// Trap focus in modals
useEffect(() => {
  if (isOpen) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    // Implement tab trap logic
  }
}, [isOpen]);
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-02
**Maintained By:** UI/UX Design Team
