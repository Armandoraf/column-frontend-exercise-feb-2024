import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: BrowserRouter });
};

test("renders application title and main heading", () => {
  renderWithRouter(<App />);

  const titleElement = screen.getByText(/Column/i);
  expect(titleElement).toBeInTheDocument();

  const mainHeadingElement = screen.getByText(
    /The go-to repository for public notices./i
  );
  expect(mainHeadingElement).toBeInTheDocument();
});
