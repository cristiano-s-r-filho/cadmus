import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SovereignButton } from './Button';
import React from 'react';

describe('SovereignButton', () => {
  it('renders correctly with default props', () => {
    render(<SovereignButton>Click Me</SovereignButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-accent'); // Verifica variante primary (default)
  });

  it('renders correctly with danger variant', () => {
    render(<SovereignButton variant="danger">Delete</SovereignButton>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button.className).toContain('text-terminal-red');
  });
});
