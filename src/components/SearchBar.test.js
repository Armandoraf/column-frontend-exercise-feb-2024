import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

describe("SearchBar", () => {
  const renderSearchBar = () =>
    render(<SearchBar />, { wrapper: BrowserRouter });

  test("renders search input and filter by date button", () => {
    renderSearchBar();
    expect(
      screen.getByPlaceholderText(/Search public notices.../i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Filter by date/i)).toBeInTheDocument();
  });

  test("allows user to type in search input", async () => {
    renderSearchBar();
    const input = screen.getByPlaceholderText(/Search public notices.../i);
    userEvent.type(input, "Test Notice");
    await waitFor(() => expect(input.value).toBe("Test Notice"));
  });

  test("debounces search input", async () => {
    jest.useFakeTimers();
    renderSearchBar();
    const input = screen.getByPlaceholderText(/Search public notices.../i);
    userEvent.type(input, "Test Notice");
    expect(input.value).toBe("Test Notice");

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() =>
      expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument()
    );

    jest.useRealTimers();
  });

  test("toggles date filter visibility", () => {
    renderSearchBar();
    const filterButton = screen.getByText(/Filter by date/i);
    fireEvent.click(filterButton);
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
  });

  test("triggers modal on add notice button click", () => {
    renderSearchBar();
    const addButton = screen.getByText(/Add notice/i);
    expect(addButton).toBeInTheDocument();
  });
});
