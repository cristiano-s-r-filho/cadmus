import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertWidget } from '../AlertWidget';
import React from 'react';

// Mock simple translation for testing
vi.mock('../../../kernel/i18n', () => ({
  useTranslation: () => ({
    t: {
      widgets: {
        alert: {
          info: 'INFORMATION',
          warning: 'CAUTION',
          error: 'CRITICAL_FAILURE',
          success: 'SYNC_COMPLETE'
        }
      }
    }
  })
}));

describe('AlertWidget', () => {
  it('renders with correct variant title', () => {
    render(<AlertWidget variant="error">System Overload</AlertWidget>);
    expect(screen.getByText('CRITICAL_FAILURE')).toBeDefined();
    expect(screen.getByText('System Overload')).toBeDefined();
  });

  it('renders custom title if provided', () => {
    render(<AlertWidget title="CUSTOM_TITLE">Message</AlertWidget>);
    expect(screen.getByText('CUSTOM_TITLE')).toBeDefined();
  });
});
