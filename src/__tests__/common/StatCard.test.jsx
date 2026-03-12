import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Users } from 'lucide-react';
import StatCard from '../../common/components/StatCard';

describe('StatCard Component', () => {
    const defaultProps = {
        icon: Users,
        label: 'Total Students',
        value: '1,234',
        color: 'border-blue-500',
    };

    it('renders the label correctly', () => {
        render(<StatCard {...defaultProps} />);
        expect(screen.getByText('Total Students')).toBeInTheDocument();
    });

    it('renders the value correctly', () => {
        render(<StatCard {...defaultProps} />);
        expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('applies the color class to the card', () => {
        const { container } = render(<StatCard {...defaultProps} />);
        // The border color class should be present in the card's className
        expect(container.firstChild).toHaveClass('border-blue-500');
    });

    it('renders with a numeric value of 0 without breaking', () => {
        render(<StatCard {...defaultProps} value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders with different labels and values', () => {
        render(<StatCard {...defaultProps} label="Active Exams" value="42" />);
        expect(screen.getByText('Active Exams')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });
});
