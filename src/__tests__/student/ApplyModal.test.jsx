import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ApplyModal from "../../../src/student/components/ApplyModal";
import { createExamApplication } from "../../../src/api";

// Mock API and toast
vi.mock("../../../src/api", () => ({
  createExamApplication: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ApplyModal Validations", () => {
  const mockExam = {
    examNo: "EXAM123",
    exam_name: "Test Exam",
    exam_code: "TE-01",
    no_of_papers: 2,
    exam_fees: 500,
    exam_start_date: "2024-05-01",
    exam_end_date: "2024-05-10",
    application_start_date: "2024-04-01",
    application_end_date: "2024-04-15",
  };

  const mockStudent = {
    studentId: "STU123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    contact: "1234567890",
    schoolName: "Test School",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) =>
    render(
      <ApplyModal
        exam={mockExam}
        student={mockStudent}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        {...props}
      />
    );

  test("does not render without exam or student data", () => {
    const { container } = render(<ApplyModal onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows error when trying to submit without checking the agreement", async () => {
    renderComponent();

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please accept the declaration before submitting")).toBeInTheDocument();
      // Ensure API was not called
      expect(createExamApplication).not.toHaveBeenCalled();
    });
  });

  test("clears error and allows submission when agreement is checked", async () => {
    renderComponent();

    createExamApplication.mockResolvedValueOnce({});

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    
    // First try without checking
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText("Please accept the declaration before submitting")).toBeInTheDocument();
    });

    // Check the box
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Error should be gone
    expect(screen.queryByText("Please accept the declaration before submitting")).not.toBeInTheDocument();

    // Submit again
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createExamApplication).toHaveBeenCalledWith(
        { status: "APPLIED" },
        "STU123",
        "EXAM123"
      );
    });
  });
});
