import { prettyDOM, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProfilePage from "../Pages/ProfilePage/ProfilePage";
import "@testing-library/jest-dom";

// Mock dependencies
vi.mock("../Tools/QueryFunctions", () => ({
  Api: () => ({
    getFriendship: vi.fn((setFriendship, setMessage, queries) => {
      setFriendship([
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

describe("ProfilePage Component", () => {
  it("Should render the loading spinner initially", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const spinner = screen.getByText(/loading/i);
    expect(spinner).toBeInTheDocument();
  });

  it("Should render friendship data when available", async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfilePage />
        <Outlet context={{ friendship: [], loggedInUser: null }} />
      </MemoryRouter>
    );

    console.log(prettyDOM(container)); // Logs the rendered DOM for inspection
  });
});
