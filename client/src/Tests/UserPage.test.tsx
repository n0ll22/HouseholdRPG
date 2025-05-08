import { prettyDOM, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import UsersPage from "../Pages/UsersPage/UsersPage";
import "@testing-library/jest-dom";

// Mock dependencies
vi.mock("../Tools/QueryFunctions", () => ({
  Api: () => ({
    getUsers: vi.fn((setUserData, setMessage, queries) => {
      setUserData([
        { _id: "1", username: "User1", email: "user1@example.com" },
        { _id: "2", username: "User2", email: "user2@example.com" },
      ]);
      setMessage({ error: "", message: "Success" });
    }),
  }),
}));

vi.mock("../Tools/socket", () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("../Components/Auth/AuthContext/UserContext", () => ({
  useUser: vi.fn(() => ({ _id: "123", username: "LoggedInUser" })),
}));

describe("UsersPage Component", () => {
  it("Should render the loading spinner initially", () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    const spinner = screen.getByText(/loading/i);
    expect(spinner).toBeInTheDocument();
  });

  it("Should render user data when available", async () => {
    const { container } = render(
      <MemoryRouter>
        <UsersPage />
        <Outlet context={{ userData: [], loggedInUser: null }} />
      </MemoryRouter>
    );

    console.log(prettyDOM(container)); // Logs the rendered DOM for inspection
  });

  it("Should display an error message if there is an error", () => {
    vi.mock("../Tools/QueryFunctions", () => ({
      Api: () => ({
        getUsers: vi.fn((setUserData, setMessage, queries) => {
          setMessage({ error: "Failed to fetch users", message: "" });
        }),
      }),
    }));

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    const errorMessage = screen.getByText(/error failed to fetch users/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
