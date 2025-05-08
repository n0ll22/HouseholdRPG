import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import App from "../App";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom"; // Import jest-dom matchers

describe("App test", () => {
  it("Should test App component", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const mainDiv = screen.getByTestId("main_test");
    expect(mainDiv).toBeInTheDocument();
  });
});
