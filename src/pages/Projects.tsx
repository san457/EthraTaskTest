import ProjectsContainer from "@/components/Projects-container";
import ProjectMembersContainer from "@/components/Project-member-container";
import { TasksContainer } from "@/components/Tasks-container";
import { useState } from "react";


const ProjectsPage = () => {
    const [selectedProject, setSelectedProject] = useState<any>(null);

    return (
        <div className="px-4 pt-4 pb-8 flex flex-col gap-8 min-h-full">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-600">Manage your organization's projects and members.</p>
            </div>
            
            <div className="flex lg:flex-row flex-col md:gap-5 gap-7">
                <ProjectsContainer onSelectProject={setSelectedProject} />
                <div className="flex-1 flex flex-col gap-6">
                    <ProjectMembersContainer project={selectedProject} />
                    {selectedProject && <TasksContainer />}
                </div>
            </div>

        </div>
    );
};

export default ProjectsPage;

