import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NoticeCard } from "./NoticeCard";
import { BrowserRouter } from "react-router-dom";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return render(ui, { wrapper: BrowserRouter });
};

describe("NoticeCard", () => {
  const mockNotice = {
    id: "1",
    title: "Test Notice",
    date: "01/01/2024",
    content: "This is a test notice content.",
  };

  test("renders correctly with given props", () => {
    renderWithRouter(<NoticeCard {...mockNotice} />);

    expect(screen.getAllByText(mockNotice.title)).toHaveLength(2);
    expect(screen.getByText(mockNotice.date)).toBeInTheDocument();
    expect(screen.getByText(mockNotice.content)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/notices/${mockNotice.id}`
    );
  });
});
