import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../../admin/components/Sidebar';

describe('Sidebar Component', () => {
    const defaultProps = {
        activeTab: 'dashboard',
        setActiveTab: vi.fn(),
    };

    it('renders the MRB Admin brand header', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByText('MRB Admin')).toBeInTheDocument();
    });

    it('renders all navigation menu items', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
        expect(screen.getByText('Regions')).toBeInTheDocument();
        expect(screen.getByText('Exam Centres')).toBeInTheDocument();
        expect(screen.getByText('Schools')).toBeInTheDocument();
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Exams')).toBeInTheDocument();
        expect(screen.getByText('Applications')).toBeInTheDocument();
        expect(screen.getByText('Publish Results')).toBeInTheDocument();
        expect(screen.getByText('View Results')).toBeInTheDocument();
    });

    it('renders the search button with keyboard shortcut hint', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByText('Search...')).toBeInTheDocument();
        expect(screen.getByText('CTRL K')).toBeInTheDocument();
    });

    it('calls setActiveTab with correct id when a menu item is clicked', () => {
        const mockSetActiveTab = vi.fn();
        render(<Sidebar activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
        
        fireEvent.click(screen.getByText('Students'));
        expect(mockSetActiveTab).toHaveBeenCalledWith('students');
    });

    it('calls setActiveTab with "regions" when Regions is clicked', () => {
        const mockSetActiveTab = vi.fn();
        render(<Sidebar activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
        
        fireEvent.click(screen.getByText('Regions'));
        expect(mockSetActiveTab).toHaveBeenCalledWith('regions');
    });

    it('calls setActiveTab with "exams" when Exams is clicked', () => {
        const mockSetActiveTab = vi.fn();
        render(<Sidebar activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
        
        fireEvent.click(screen.getByText('Exams'));
        expect(mockSetActiveTab).toHaveBeenCalledWith('exams');
    });
});
