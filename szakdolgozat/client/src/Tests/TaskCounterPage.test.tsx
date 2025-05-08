import { render, screen, fireEvent } from "@testing-library/react";
import TaskComplete from "../Components/TaskCounter/TaskCounter";
import { TaskProp, QueryProps } from "../Tools/types";
import { describe, expect, it, vi } from "vitest";

//Feladatok utánozása
const mockTasks: TaskProp[] = [
  {
    _id: "1",
    title: "Clean kitchen",
    exp: 20,
    _length: 600,
    description: "desc",
    tutorial: [],
  },
  {
    _id: "2",
    title: "Vacuum",
    exp: 15,
    _length: 300,
    description: "desc",
    tutorial: [],
  },
];
//Query untánozása
const queries: QueryProps = {
  search: "",
  searchOn: "",
  sortBy: "",
  order: "",
  page: 0,
  limit: 10,
};

//funkciók utánozása
const mockHandlers = {
  handleRemoveTask: vi.fn(),
  handleSearch: vi.fn(),
  handleFinish: vi.fn(),
  setIsVisible: vi.fn(),
  handleAddTask: vi.fn(),
};

//Feladat elvégézésének unit-testelése
describe("TaskComplete component", () => {
  //
  it("Renders search input and tasks when visible", () => {
    render(
      <TaskComplete
        currentTasks={mockTasks}
        tasks={mockTasks}
        queries={queries}
        isVisible={true}
        handleRemoveTask={mockHandlers.handleRemoveTask}
        handleSearch={mockHandlers.handleSearch}
        handleFinish={mockHandlers.handleFinish}
        setIsVisible={mockHandlers.setIsVisible}
        handleAddTask={mockHandlers.handleAddTask}
        progressbar={50}
        renderTime="5:00"
        selectedTask={null}
        process={null}
      />
    );

    // Keresési sáv keresése
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();

    // feladatok címének keresése
    const taskTitles = screen.getAllByText(/EXP:/i);
    expect(taskTitles.length).toBe(mockTasks.length);

    // funkció kattintás ellenőrzése
    fireEvent.click(screen.getAllByText("Clean kitchen")[0]);
    expect(mockHandlers.handleAddTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("Calls handleFinish when Finish Day button is clicked", () => {
    render(
      <TaskComplete
        currentTasks={mockTasks}
        tasks={mockTasks}
        queries={queries}
        isVisible={false}
        handleRemoveTask={mockHandlers.handleRemoveTask}
        handleSearch={mockHandlers.handleSearch}
        handleFinish={mockHandlers.handleFinish}
        setIsVisible={mockHandlers.setIsVisible}
        handleAddTask={mockHandlers.handleAddTask}
        progressbar={80}
        renderTime="8:00"
        selectedTask={null}
        process={null}
      />
    );

    const finishBtn = screen.getByRole("button", { name: /Finish Day/i });
    fireEvent.click(finishBtn);
    expect(mockHandlers.handleFinish).toHaveBeenCalled();
  });
});
