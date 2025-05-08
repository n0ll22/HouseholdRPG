import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { useUser } from "../Components/Auth/AuthContext/UserContext";
import TaskManagerPage from "../Pages/TaskManagerPage/TaskManagerPage";
import { Api } from "../Tools/QueryFunctions";

// Mocks
vi.mock("../Components/Auth/AuthContext/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("../Tools/QueryFunctions", () => ({
  Api: () => ({
    getTaskWithQuery: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: vi.fn(),
    Outlet: () => <div data-testid="outlet" />,
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  };
});

vi.mock("../Components/SearchAndPagination/SearchAndPagintaion", () => ({
  default: () => <div data-testid="search-pagination">SearchPagination</div>,
}));

vi.mock("../Components/LoadingSpinner/LoadingSpinner", () => ({
  default: ({ loading }: any) =>
    loading ? <div data-testid="loading">Loading...</div> : null,
}));

describe("TaskManagerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders admin view with buttons and search", () => {
    (useUser as any).mockReturnValue({ isAdmin: true });
    (useLocation as any).mockReturnValue({ pathname: "/admin/task/list" });

    render(<TaskManagerPage />);

    expect(screen.getByText("List Tasks")).toBeInTheDocument();
    expect(screen.getByText("Edit Tasks")).toBeInTheDocument();
    expect(screen.getByText("Add Tasks")).toBeInTheDocument();
    expect(screen.getByTestId("search-pagination")).toBeInTheDocument();
  });

  it("renders non-admin view when on list route", () => {
    (useUser as any).mockReturnValue(null);
    (useLocation as any).mockReturnValue({ pathname: "/admin/task/list" });

    render(<TaskManagerPage />);

    expect(screen.getByTestId("search-pagination")).toBeInTheDocument();
  });

  it("shows permission denied for non-admin on other routes", () => {
    (useUser as any).mockReturnValue(null);
    (useLocation as any).mockReturnValue({ pathname: "/admin/task/edit" });

    render(<TaskManagerPage />);

    expect(
      screen.getByText("You don't have permisson for this page!")
    ).toBeInTheDocument();
    expect(screen.getByText("< Return")).toBeInTheDocument();
  });

  it("shows loading spinner if no message is returned", () => {
    (useUser as any).mockReturnValue({ isAdmin: true });
    (useLocation as any).mockReturnValue({ pathname: "/admin/task/list" });

    render(<TaskManagerPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });
});
