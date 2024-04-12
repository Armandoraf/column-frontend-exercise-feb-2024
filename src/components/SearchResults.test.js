import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { SearchResults } from "./SearchResults";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  getDocs: jest.fn(),
}));

const mockGetDocs = (docs) => {
  getDocs.mockReturnValue(
    Promise.resolve({
      docs: docs.map((doc) => ({
        id: doc.id,
        data: () => doc.data,
      })),
    })
  );
};

describe("SearchResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders and fetches data correctly", async () => {
    mockGetDocs([
      {
        id: "1",
        data: {
          title: "Test Notice 1",
          publicationDate: { seconds: new Date("2021-01-01").getTime() / 1000 },
          content: "Content 1",
        },
      },
      {
        id: "2",
        data: {
          title: "Test Notice 2",
          publicationDate: { seconds: new Date("2021-02-01").getTime() / 1000 },
          content: "Content 2",
        },
      },
    ]);

    render(<SearchResults />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getAllByText("Test Notice 1")).toHaveLength(2);
    });

    await waitFor(() => {
      expect(screen.getAllByText("Test Notice 2")).toHaveLength(2);
    });
  });

  test("handles pagination correctly", async () => {
    mockGetDocs([
      {
        id: "1",
        data: {
          title: "Test Notice 1",
          publicationDate: { seconds: new Date("2021-01-01").getTime() / 1000 },
          content: "Content 1",
        },
      },
    ]);

    render(<SearchResults />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getAllByText("Test Notice 1")).toHaveLength(2);
    });
  });

  test("displays loading state", async () => {
    getDocs.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ docs: [] }), 100))
    );

    render(<SearchResults />, { wrapper: BrowserRouter });

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });
});
