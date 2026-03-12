import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StudentLogin from '../../student/components/StudentLogin';

const mockStudents = [
    { studentId: 1, username: 'Alice' },
    { studentId: 2, username: 'Bob' },
    { studentId: 3, username: 'Charlie' },
];

describe('StudentLogin Component', () => {
    it('renders the Student Login heading', () => {
        render(<StudentLogin students={mockStudents} setCurrentUser={() => {}} />);
        expect(screen.getByText('Student Login')).toBeInTheDocument();
    });

    it('renders a button for each student', () => {
        render(<StudentLogin students={mockStudents} setCurrentUser={() => {}} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('displays student IDs alongside names', () => {
        render(<StudentLogin students={mockStudents} setCurrentUser={() => {}} />);
        expect(screen.getByText('ID: 1')).toBeInTheDocument();
        expect(screen.getByText('ID: 2')).toBeInTheDocument();
    });

    it('shows "No students available" message when list is empty', () => {
        render(<StudentLogin students={[]} setCurrentUser={() => {}} />);
        expect(screen.getByText('No students available')).toBeInTheDocument();
    });

    it('calls setCurrentUser with correct student when a student is clicked', () => {
        const mockSetCurrentUser = vi.fn();
        render(<StudentLogin students={mockStudents} setCurrentUser={mockSetCurrentUser} />);
        
        fireEvent.click(screen.getByText('Bob'));
        expect(mockSetCurrentUser).toHaveBeenCalledWith({ studentId: 2, username: 'Bob' });
    });

    it('calls setCurrentUser only once per click', () => {
        const mockSetCurrentUser = vi.fn();
        render(<StudentLogin students={mockStudents} setCurrentUser={mockSetCurrentUser} />);
        
        fireEvent.click(screen.getByText('Alice'));
        expect(mockSetCurrentUser).toHaveBeenCalledTimes(1);
    });
});
