import { render, screen, fireEvent } from "@testing-library/react";
import AvatarSelector from "../Components/AvatarSelector/AvatarSelector";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";

describe("AvatarSelector Component", () => {
  it("Should render the AvatarSelector component", () => {
    const mockHandleAvatarChange = vi.fn();

    render(<AvatarSelector handleAvatarChange={mockHandleAvatarChange} />);

    // Check if the title is rendered
    const title = screen.getByText("Choose your avatar!");
    expect(title).toBeInTheDocument();

    // Check if the cancel button is rendered
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    expect(cancelButton).toBeInTheDocument();
  });

  it("Should display a list of avatars", () => {
    const mockHandleAvatarChange = vi.fn();

    render(<AvatarSelector handleAvatarChange={mockHandleAvatarChange} />);

    // Check if avatar divs are rendered
    const avatarDivs = screen.getAllByRole("button"); // Query divs as buttons
    expect(avatarDivs.length).toBeGreaterThan(0);
  });

  it("Should call handleAvatarChange when an avatar is clicked", () => {
    const mockHandleAvatarChange = vi.fn();

    render(<AvatarSelector handleAvatarChange={mockHandleAvatarChange} />);

    // Simulate clicking on the first avatar
    const avatarDivs = screen.getAllByRole("button"); // Query divs as buttons
    fireEvent.click(avatarDivs[0]);

    // Check if the mock function was called
    expect(mockHandleAvatarChange).toHaveBeenCalled();
  });

  it("Should close the AvatarSelector when Cancel is clicked", () => {
    const mockHandleAvatarChange = vi.fn();

    render(<AvatarSelector handleAvatarChange={mockHandleAvatarChange} />);

    // Simulate clicking the cancel button
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    // Check if the AvatarSelector is no longer in the document
    const title = screen.queryByText("Choose your avatar!");
    expect(title).not.toBeInTheDocument();
  });
});
