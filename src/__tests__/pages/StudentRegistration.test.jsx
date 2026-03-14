import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import StudentRegistration from "../../../src/pages/StudentRegistration";
import { createStudent, getSchools } from "../../../src/api";

// Mock the API calls
vi.mock("../../../src/api", () => ({
  createStudent: vi.fn(),
  getSchools: vi.fn(),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("StudentRegistration Form Validations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSchools.mockResolvedValue({
      content: [{ schoolId: 1, schoolName: "Test School" }],
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <StudentRegistration />
      </BrowserRouter>
    );

  test("shows validation errors when submitting an empty form", async () => {
    renderComponent();

    // The form requires HTML5 validation (required attributes), 
    // to test our custom JS validation logic we need to bypass it or fill the required fields 
    // and provide invalid data. Let's provide invalid data directly.

    const submitButton = screen.getByRole("button", { name: /create account/i });
    
    // Simulate clicking submit (if browser validation overrides this, our JS validation still runs if we prevent default)
    // Actually, HTML5 'required' will stop form submission in a real browser, 
    // but in jsdom, fireEvent.click on submit often triggers the submit event anyway.
    fireEvent.click(submitButton);

    // After form validation runs
    await waitFor(() => {
      expect(screen.getByText("First Name is required")).toBeInTheDocument();
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expect(screen.getByText("Please select mother tongue")).toBeInTheDocument();
      expect(screen.getByText("Please select a school")).toBeInTheDocument();
    });
  });

  test("shows error for invalid email and phone number", async () => {
    renderComponent();

    // Fill invalid data
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John", name: "firstName" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe", name: "lastName" } });
    fireEvent.change(screen.getByLabelText(/Contact Number/i), { target: { value: "12345", name: "contact" } }); // < 10 digits
    fireEvent.change(screen.getByLabelText(/Email ID/i), { target: { value: "invalid-email", name: "email" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Contact number must be exactly 10 digits")).toBeInTheDocument();
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  test("shows error when passwords do not match", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123", name: "password" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password456", name: "confirmPassword" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  test("clears error message when user types in an invalid field", async () => {
    renderComponent();

    // Enter short password
    const passwordInput = screen.getByLabelText(/^Password/i);
    fireEvent.change(passwordInput, { target: { value: "123", name: "password" } });
    
    // Submit to trigger error
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });

    // Fix the password
    fireEvent.change(passwordInput, { target: { value: "123456", name: "password" } });

    // The error should disappear immediately
    await waitFor(() => {
      expect(screen.queryByText("Password must be at least 6 characters")).not.toBeInTheDocument();
    });
  });
});
