# Testing Quick Start Guide

## Quick Command Reference

```bash
# Run all unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm run test:unit -- error-boundary.test.tsx
```

## Test File Locations

```
tests/
├── unit/                    # Component unit tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests
├── utils/                   # Test helpers
└── setup.ts                 # Global test setup
```

## Writing a New Test

### Unit Test Template

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { YourComponent } from '@/app/components/your-component';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

## Common Testing Patterns

### Testing State Changes

```typescript
it('updates state on button click', async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.click(screen.getByRole('button'));

  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### Testing Keyboard Events

```typescript
import { triggerKeyboardEvent } from '@/tests/utils/test-helpers';

it('opens modal with keyboard shortcut', () => {
  render(<Component />);

  triggerKeyboardEvent('?');

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

### Testing LocalStorage

```typescript
it('saves settings to localStorage', async () => {
  const user = userEvent.setup();
  render(<Settings />);

  await user.click(screen.getByRole('button', { name: /save/i }));

  expect(localStorage.getItem('theme')).toBe('dark');
});
```

### Testing Accessibility

```typescript
it('has proper ARIA attributes', () => {
  render(<Component />);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby');
});
```

## Test Helpers Available

```typescript
import {
  renderWithProviders,
  triggerKeyboardEvent,
  mockLocalStorage,
  mockMatchMedia,
  createMockBeforeInstallPromptEvent,
  suppressConsole,
  waitForAsync,
} from '@/tests/utils/test-helpers';
```

## Debugging Tests

### Run Single Test

```bash
npm run test:unit -- -t "test name pattern"
```

### Run in Debug Mode

```bash
npm run test:unit -- --inspect-brk
```

### View Test Output

```bash
npm run test:unit -- --reporter=verbose
```

### Check Coverage for Specific File

```bash
npm run test:coverage -- error-boundary.test.tsx
```

## Coverage Thresholds

Current thresholds in `vitest.config.mts`:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Best Practices

### ✅ DO

- Use descriptive test names
- Follow AAA pattern (Arrange-Act-Assert)
- Test user behavior, not implementation
- Clean up after each test
- Mock external dependencies
- Test edge cases and errors
- Use proper accessibility queries (getByRole, getByLabelText)

### ❌ DON'T

- Test implementation details
- Share state between tests
- Use setTimeout in tests
- Test third-party library functionality
- Create snapshot tests (they're brittle)
- Use generic matchers like toBeTruthy()

## Accessibility Testing Checklist

- [ ] Component has proper ARIA attributes
- [ ] Keyboard navigation works
- [ ] Focus management is correct
- [ ] Screen reader announcements are present
- [ ] Color contrast is sufficient (manual check)
- [ ] Interactive elements have accessible labels

## E2E Testing Tips

### Page Object Pattern

```typescript
class SettingsPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.keyboard.press('s');
  }

  async changeTheme(theme: 'light' | 'dark') {
    await this.page.getByRole('button', { name: theme }).click();
  }
}
```

### Waiting for Elements

```typescript
await expect(page.getByText('Loading...')).toBeVisible();
await expect(page.getByText('Loading...')).not.toBeVisible();
await expect(page.getByText('Content')).toBeVisible();
```

## Troubleshooting

### Tests Fail with "React is not defined"

Solution: Make sure React is imported in the test file:
```typescript
import React from 'react';
```

### Tests Timeout

Solution: Increase timeout or use `waitFor`:
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

### LocalStorage Not Working

Solution: Clear localStorage before each test:
```typescript
beforeEach(() => {
  localStorage.clear();
});
```

### Component Not Rendering

Solution: Check if component needs providers:
```typescript
render(
  <ToastProvider>
    <YourComponent />
  </ToastProvider>
);
```

## CI/CD Integration

Tests run automatically on:
- Every push to GitHub
- Every pull request
- Before deployment

Coverage reports are:
- Generated on every test run
- Uploaded to Codecov (if configured)
- Displayed in PR comments

## Test Maintenance

### Weekly

- Review failing tests
- Update snapshots if needed
- Check test execution time

### Monthly

- Review test coverage
- Remove redundant tests
- Update test documentation

### Quarterly

- Audit all tests
- Update testing dependencies
- Review and improve test patterns

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Getting Help

1. Check test error messages carefully
2. Review similar passing tests
3. Check component implementation
4. Consult testing documentation
5. Ask team members

---

**Happy Testing! 🧪**
