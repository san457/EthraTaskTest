import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/context/context";
import api from "@/lib/api";

export function TasksContainer() {
  const { SetTaskOpen, SelectProject, SetUpdateTaskData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const refreshTasks = async () => {
    try {
      setLoading(true);
      const url = SelectProject 
        ? `/tasks/project/${SelectProject.id}` 
        : '/tasks/me';
      
      const res = await api.get(url);
      const allTasks = res.data.tasks || [];
      setTasks(allTasks);
      applyFilter(activeFilter, allTasks); 
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };



  const applyFilter = (filter: string, taskList: any[] = tasks) => {
    setActiveFilter(filter);

    let filtered = taskList;

    if (filter === "To Do") {
      filtered = taskList.filter((t) => t.status === 'todo');
    } else if (filter === "In Progress") {
      filtered = taskList.filter((t) => t.status === 'in_progress');
    } else if (filter === "Completed") {
      filtered = taskList.filter((t) => t.status === 'completed');
    }

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    refreshTasks();
  }, [SelectProject]);

  useEffect(() => {
    window.refreshTasks = refreshTasks;
  }, [refreshTasks]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl scroll-none shadow-sm p-4 flex flex-col h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {SelectProject ? `Project: ${SelectProject.name}` : "My Managed Tasks"}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 text-sm cursor-pointer"
            onClick={() => {
              SetUpdateTaskData(null);
              SetTaskOpen(true);
            }}
          >
            + Task
          </Button>

         {tasks.length > 0 && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="icon" className="h-8 w-8 p-0">
        <i className="bi bi-three-dots-vertical text-gray-700 text-base"></i>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => applyFilter("All")}>
        All Tasks
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => applyFilter("To Do")}>
        To Do
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => applyFilter("In Progress")}>
        In Progress
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => applyFilter("Completed")}>
        Completed
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}
         
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-sm text-gray-500">No tasks to show.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-semibold text-gray-900 break-words w-full max-w-[85%]">
                  {task.title}
                </h3>

                {task.status === 'completed' ? (
                  <div className="h-6 w-6 shrink-0 rounded-full bg-green-500" />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="h-6 w-6 shrink-0 rounded-full bg-gray-400 hover:bg-gray-500 transition"
                      ></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={async () => {
                          await api.put("/tasks/update", { taskId: task.id, status: 'completed' });
                          refreshTasks();
                        }}
                      >
                        Mark Completed
                      </DropdownMenuItem>
                      {task.status === 'todo' && (
                        <DropdownMenuItem
                          onClick={async () => {
                            await api.put("/tasks/update", { taskId: task.id, status: 'in_progress' });
                            refreshTasks();
                          }}
                        >
                          Mark In Progress
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={async () => {
                          await api.delete("/tasks/delete", { data: { taskId: task.id } });
                          refreshTasks();
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => {
                          SetUpdateTaskData(task);
                          SetTaskOpen(true);
                        }}
                      >
                        Update
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-xs text-gray-600 capitalize mt-1 break-words whitespace-pre-wrap">
                {task.description}
              </p>
              <div className="flex gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${task.priority === 'high' ? 'border-red-200 text-red-600 bg-red-50' : task.priority === 'medium' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-green-200 text-green-600 bg-green-50'}`}>
                  {task.priority}
                </span>
                <div className="text-[10px] text-gray-500 uppercase font-medium self-center">
                  Status: {task.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

