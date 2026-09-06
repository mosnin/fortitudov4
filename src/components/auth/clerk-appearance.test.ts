import { describe, expect, it } from 'vitest';
import { clerkAuthAppearance } from './clerk-appearance';

describe('auth palette', () => {
  it('overrides every inherited light surface on the charcoal login page', () => {
    const appearance = clerkAuthAppearance(true);
    expect(appearance.variables).toMatchObject({
      colorBackground: '#101010', colorForeground: '#f1f3f5',
      colorInput: '#181818', colorInputForeground: '#f1f3f5',
      colorPrimary: '#f8cd02', colorPrimaryForeground: '#101010',
    });
    expect(appearance.elements.card).toMatchObject({ backgroundColor: 'transparent', padding: 0 });
    expect(appearance.elements.footer).toEqual({ display: 'none' });
  });
  it('retains a legible light palette for existing optional callers', () => {
    expect(clerkAuthAppearance(false).variables).toMatchObject({
      colorBackground: '#ffffff', colorForeground: '#1c1917',
      colorInput: '#ffffff', colorInputForeground: '#1c1917',
    });
  });
});
