import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExamList from '../../student/components/ExamList';

const mockExams = [
    { examNo: 101, exam_name: 'Mathematics Board Exam', no_of_papers: 3, exam_fees: 500 },
    { examNo: 102, exam_name: 'Science Board Exam', no_of_papers: 2, exam_fees: 350 },
];

describe('ExamList Component', () => {
    it('renders the "Available Exams" heading', () => {
        render(<ExamList exams={mockExams} openApplyModal={() => {}} />);
        expect(screen.getByText('Available Exams')).toBeInTheDocument();
    });

    it('renders all exam names from the list', () => {
        render(<ExamList exams={mockExams} openApplyModal={() => {}} />);
        expect(screen.getByText('Mathematics Board Exam')).toBeInTheDocument();
        expect(screen.getByText('Science Board Exam')).toBeInTheDocument();
    });

    it('renders exam numbers as badges', () => {
        render(<ExamList exams={mockExams} openApplyModal={() => {}} />);
        expect(screen.getByText('Exam #101')).toBeInTheDocument();
        expect(screen.getByText('Exam #102')).toBeInTheDocument();
    });

    it('renders number of papers for each exam', () => {
        render(<ExamList exams={mockExams} openApplyModal={() => {}} />);
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders exam fees for each exam', () => {
        render(<ExamList exams={mockExams} openApplyModal={() => {}} />);
        expect(screen.getByText('$500')).toBeInTheDocument();
        expect(screen.getByText('$350')).toBeInTheDocument();
    });

    it('shows "No exams available" when the exams list is empty', () => {
        render(<ExamList exams={[]} openApplyModal={() => {}} />);
        expect(screen.getByText('No exams available')).toBeInTheDocument();
    });

    it('calls openApplyModal with correct exam when Apply Now is clicked', () => {
        const mockOpenApplyModal = vi.fn();
        render(<ExamList exams={mockExams} openApplyModal={mockOpenApplyModal} />);
        
        // There are two "Apply Now" buttons, click the first one
        const applyButtons = screen.getAllByText('Apply Now');
        fireEvent.click(applyButtons[0]);
        
        expect(mockOpenApplyModal).toHaveBeenCalledWith(mockExams[0]);
    });

    it('calls openApplyModal with second exam when second Apply Now is clicked', () => {
        const mockOpenApplyModal = vi.fn();
        render(<ExamList exams={mockExams} openApplyModal={mockOpenApplyModal} />);
        
        const applyButtons = screen.getAllByText('Apply Now');
        fireEvent.click(applyButtons[1]);
        
        expect(mockOpenApplyModal).toHaveBeenCalledWith(mockExams[1]);
    });
});
