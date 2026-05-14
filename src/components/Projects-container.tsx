import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Search, Code, Server, Palette, Bug, } from 'lucide-react';
import type { LucideIcon } from "lucide-react"
import { useAppContext } from '@/context/context';

interface Project {
  id: string;

  name: string;
  membercount: number;
  icon: LucideIcon;
  color: string;
}

const icons = [Code, Server, Palette, Bug];
const colors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600'
];

declare global {
  interface Window {
    fetchProjects: () => Promise<void>;
  }
}

export default function ProjectsContainer({ onSelectProject }: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { SetSelectProject } = useAppContext()

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');

      const fetchedProjects = res.data.projects || [];

      const enhanced: Project[] = fetchedProjects.map((project: any) => {
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return {
          ...project,
          icon: randomIcon,
          color: randomColor,
          membercount: parseInt(project.membercount) || 0,
        };
      });

      setProjects(enhanced);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    window.fetchProjects = fetchProjects;
  }, []);

  return (
    <div className="w-full lg:w-1/2 h-[50vh] bg-white border p-4 overflow-y-auto shadow-sm rounded-2xl scroll-none">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      {projects.map((project) => (
        <div
          key={project.id}
          className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center"
          onClick={() => {
            SetSelectProject(project);
            if (onSelectProject) onSelectProject(project);
          }}
        >
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${project.color}`}>
            <project.icon className="h-4 w-4" />
          </div>
          <div className="ml-3 flex-1">
            <h4 className="font-medium text-gray-900">{project.name}</h4>
            <p className="text-xs text-gray-500">{project.membercount} members</p>
          </div>
        </div>
      ))}
    </div>
  );
}

