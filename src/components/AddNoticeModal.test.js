import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { AddNoticeModal } from "./AddNoticeModal";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("AddNoticeModal", () => {
  const mockOnClose = jest.fn();
  const mockOnNoticeAdded = jest.fn();

  const renderAddNoticeModal = () =>
    render(
      <AddNoticeModal onClose={mockOnClose} onNoticeAdded={mockOnNoticeAdded} />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with all inputs and a submit button", () => {
    renderAddNoticeModal();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("captures user input in title, date, and content fields", async () => {
    renderAddNoticeModal();
    const titleInput = screen.getByLabelText(/Title/i);
    const dateInput = screen.getByLabelText(/Date/i);
    const contentInput = screen.getByLabelText(/Content/i);

    await userEvent.type(titleInput, "Test Title");
    expect(titleInput.value).toBe("Test Title");

    await userEvent.type(dateInput, "2024-01-01");
    expect(dateInput.value).toBe("2024-01-01");

    await userEvent.type(contentInput, "Test Content");
    expect(contentInput.value).toBe("Test Content");
  });

  test("closes the modal on close button click", () => {
    renderAddNoticeModal();
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("closes the modal on escape key press", () => {
    renderAddNoticeModal();
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
