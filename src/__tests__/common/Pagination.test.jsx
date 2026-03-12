import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../../common/components/Pagination';

describe('Pagination Component', () => {
    it('does not render if totalPages is 1 or less', () => {
        const { container } = render(<Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders correct page information text', () => {
        render(<Pagination currentPage={0} totalPages={5} onPageChange={() => {}} />);
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });

    it('renders correct numbered page buttons', () => {
        render(<Pagination currentPage={0} totalPages={5} onPageChange={() => {}} />);
        for (let i = 1; i <= 5; i++) {
            expect(screen.getByText(i.toString())).toBeInTheDocument();
        }
    });

    it('calls onPageChange with correct value when next page is clicked', () => {
        const mockOnPageChange = vi.fn();
        render(<Pagination currentPage={0} totalPages={5} onPageChange={mockOnPageChange} />);
        fireEvent.click(screen.getByTitle('Next Page'));
        expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange with correct value when previous page is clicked', () => {
        const mockOnPageChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
        fireEvent.click(screen.getByTitle('Previous Page'));
        expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange with 0 when First Page is clicked', () => {
        const mockOnPageChange = vi.fn();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
        fireEvent.click(screen.getByTitle('First Page'));
        expect(mockOnPageChange).toHaveBeenCalledWith(0);
    });

    it('calls onPageChange with last page index when Last Page is clicked', () => {
        const mockOnPageChange = vi.fn();
        render(<Pagination currentPage={0} totalPages={5} onPageChange={mockOnPageChange} />);
        fireEvent.click(screen.getByTitle('Last Page'));
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('disables First and Previous buttons when on first page', () => {
        render(<Pagination currentPage={0} totalPages={5} onPageChange={() => {}} />);
        expect(screen.getByTitle('First Page')).toBeDisabled();
        expect(screen.getByTitle('Previous Page')).toBeDisabled();
        expect(screen.getByTitle('Next Page')).not.toBeDisabled();
        expect(screen.getByTitle('Last Page')).not.toBeDisabled();
    });

    it('disables Next and Last buttons when on last page', () => {
        render(<Pagination currentPage={4} totalPages={5} onPageChange={() => {}} />);
        expect(screen.getByTitle('Next Page')).toBeDisabled();
        expect(screen.getByTitle('Last Page')).toBeDisabled();
        expect(screen.getByTitle('First Page')).not.toBeDisabled();
        expect(screen.getByTitle('Previous Page')).not.toBeDisabled();
    });
});
