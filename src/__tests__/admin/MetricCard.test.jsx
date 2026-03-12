import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricCard from '../../admin/components/MetricCard';

describe('MetricCard Component', () => {
    it('renders the label correctly', () => {
        render(<MetricCard label="Total Applications" value={320} />);
        expect(screen.getByText('Total Applications')).toBeInTheDocument();
    });

    it('renders the value correctly', () => {
        render(<MetricCard label="Total Applications" value={320} />);
        expect(screen.getByText('320')).toBeInTheDocument();
    });

    it('renders string values correctly', () => {
        render(<MetricCard label="Pass Rate" value="87%" />);
        expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('applies a custom background color to the icon container', () => {
        render(<MetricCard label="Score" value={99} color="#ff5733" />);
        // Find the icon container and check its inline style
        const iconContainer = document.querySelector('[style*="background-color"]');
        expect(iconContainer).not.toBeNull();
        expect(iconContainer.style.backgroundColor).toBe('rgb(255, 87, 51)');
    });

    it('uses default color when no color prop is passed', () => {
        render(<MetricCard label="Score" value={99} />);
        const iconContainer = document.querySelector('[style*="background-color"]');
        // Default color is #4c84ff
        expect(iconContainer.style.backgroundColor).toBe('rgb(76, 132, 255)');
    });

    it('renders with a value of 0 without breaking', () => {
        render(<MetricCard label="Failed" value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });
});
