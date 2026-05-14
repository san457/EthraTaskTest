import { TasksContainer } from "@/components/Tasks-container";

const TasksPage = () => {
    return (
        <div className="px-4 pt-4 pb-8 flex flex-col gap-8 min-h-full">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                <p className="text-sm text-gray-600">Track and manage your project tasks.</p>
            </div>
            
            <TasksContainer />
        </div>
    );
};

export default TasksPage;
