import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NoticeDetails } from "./NoticeDetails";
import { MemoryRouter } from "react-router-dom";
import { getDoc } from "firebase/firestore";

jest.mock("firebase/firestore");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "testId",
  }),
}));

describe("NoticeDetails", () => {
  test("shows loading state initially", async () => {
    render(
      <MemoryRouter>
        <NoticeDetails />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );
  });

  test("handles error when notice does not exist", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => false,
    });

    render(
      <MemoryRouter>
        <NoticeDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Could not find notice with id: testId")
      ).toBeInTheDocument();
    });
  });
});
