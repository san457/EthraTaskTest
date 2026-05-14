declare global {
  interface Window {
    refreshTasks?: () => void;
  }
}

import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/context';
import { toast } from 'sonner';
import api from '@/lib/api';

export function CreateTask() {
  const {
    TaskOpen,
    SetTaskOpen,
    SelectProject,
    SetSelectProject,
    UpdateTaskData,
    SetUpdateTaskData
  } = useAppContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    if (TaskOpen) {
      if (UpdateTaskData) {
        setTitle(UpdateTaskData.title || '');
        setDescription(UpdateTaskData.description || '');
        setPriority(UpdateTaskData.priority || 'medium');
        setSelectedProjectId(UpdateTaskData.project_id || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setSelectedProjectId(SelectProject?.id || '');
      }
      
      // Fetch projects to allow selection if none or to change
      const fetchProjects = async () => {
        try {
          const res = await api.get('/projects');
          setProjects(res.data.projects || []);
        } catch (err) {
          console.error('Failed to fetch projects', err);
        }
      };
      fetchProjects();
    }
  }, [TaskOpen, UpdateTaskData, SelectProject]);

  const handleSubmit = async () => {
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    const projectId = selectedProjectId || SelectProject?.id;
    if (!projectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      setLoading(true);

      if (UpdateTaskData?.id) {
        await api.put('/tasks/update', {
          taskId: UpdateTaskData.id,
          title,
          description,
          priority,
          projectId
        });
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks/create', {
          title,
          description,
          projectId,
          priority
        });
        toast.success('Task created successfully');
      }

      SetTaskOpen(false);
      SetUpdateTaskData(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      window.refreshTasks?.();

    } catch (err: any) {
      console.error('Failed to save task', err);
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog
      open={TaskOpen}
      onOpenChange={(open) => {
        SetTaskOpen(open);
        if (!open) {
          setTitle('');
          setDescription('');
          SetUpdateTaskData(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {UpdateTaskData ? 'Update Task' : 'Create a new Task'}
          </DialogTitle>
          <DialogDescription>
            {UpdateTaskData
              ? 'Edit your task details below.'
              : 'Fill out the form to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Title</label>
              <Input
                placeholder="Enter Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Description</label>
              <Input
                placeholder="Enter Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Project</label>
              <select 
                value={selectedProjectId} 
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading
              ? UpdateTaskData
                ? 'Updating...'
                : 'Creating...'
              : UpdateTaskData
              ? 'Update'
              : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


