import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ExamManager from "../../../src/admin/components/ExamManager";

// Create a query client for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe("ExamManager Validations", () => {
  const commonProps = {
    examForm: {
      exam_code: "",
      exam_name: "",
      exam_fees: 0,
      application_start_date: "",
      application_end_date: "",
      exam_start_date: "",
      exam_end_date: "",
      no_of_papers: 1,
      papers: [{ name: "", maxMarks: 100 }],
      status: "DRAFT",
    },
    setExamForm: vi.fn(),
    handleCreateExam: vi.fn(),
    handleUpdateExam: vi.fn(),
    handleDeleteExam: vi.fn(),
    startEditing: vi.fn(),
    isEditing: false,
    resetExamForm: vi.fn(),
  };

  const renderComponent = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <ExamManager {...commonProps} {...props} />
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Step 0: Validates required basic info fields", () => {
    renderComponent();

    // Try to click Next on Step 0 without filling data
    const nextBtn = screen.getByTestId("next-wizard-button");
    fireEvent.click(nextBtn);

    expect(screen.getByText("Exam Code is required")).toBeInTheDocument();
    expect(screen.getByText("Exam Name is required")).toBeInTheDocument();
  });

  test("Step 1: Validates date logic (end dates after start dates)", async () => {
    renderComponent({
      examForm: {
        ...commonProps.examForm,
        exam_code: "TEST1",
        exam_name: "Test Exam",
        application_start_date: "2024-05-10",
        application_end_date: "2024-05-01", // Invalid: before start
        exam_start_date: "2024-06-10",
        exam_end_date: "2024-06-05", // Invalid: before start
      },
    });

    // Move to step 1
    fireEvent.click(screen.getByTestId("next-wizard-button")); 

    // Click next again to validate Step 1
    fireEvent.click(screen.getByTestId("next-wizard-button"));

    await waitFor(() => {
      const errors = screen.getAllByText(/Must be after start date/i);
      expect(errors).toHaveLength(2);
    });
  });

  test("Step 1: Validates Exam Start after Application End", async () => {
    renderComponent({
      examForm: {
        ...commonProps.examForm,
        exam_code: "TEST2",
        exam_name: "Test Exam 2",
        application_start_date: "2024-05-01",
        application_end_date: "2024-05-10",
        exam_start_date: "2024-05-05", // Invalid: before app end
        exam_end_date: "2024-05-15",
      }
    });

    fireEvent.click(screen.getByTestId("next-wizard-button")); // To Step 1
    fireEvent.click(screen.getByTestId("next-wizard-button")); // Validate Step 1

    await waitFor(() => {
      expect(screen.getByText(/Must be after application end date/i)).toBeInTheDocument();
    });
  });

  test("Step 2: Validates number of papers and individual paper rules", () => {
    renderComponent({
      examForm: {
        ...commonProps.examForm,
        exam_code: "TEST1",
        exam_name: "Test Exam",
        application_start_date: "2024-05-01",
        application_end_date: "2024-05-10",
        exam_start_date: "2024-06-01",
        exam_end_date: "2024-06-10",
        no_of_papers: 1,
        papers: [{ name: "   ", maxMarks: 0 }], // Invalid paper name and marks
      },
    });

    // Move to step 1
    fireEvent.click(screen.getByTestId("next-wizard-button"));
    // Move to step 2
    fireEvent.click(screen.getByTestId("next-wizard-button"));

    // Validate step 2
    fireEvent.click(screen.getByTestId("next-wizard-button"));

    expect(screen.getAllByText("Required")).toHaveLength(2); // One for name, one for marks
  });
});
