declare global {
  interface Window {
    fetchProjects: () => Promise<void>;
  }
}

import { useState } from 'react'
import api from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppContext } from '@/context/context'

export function CreateProjectDialog() {
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const { SetProjectOpen, ProjectOpen } = useAppContext()
  const [loading, setLoading] = useState(false)

  const handleCreateProject = async () => {
    if (!projectName.trim()) return

    try {
      setLoading(true)

      const response = await api.post('/projects/create', { 
        name: projectName,
        description: description 
      })

      setProjectName("")
      setDescription("")
      SetProjectOpen(false) 
      window.fetchProjects?.();
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={ProjectOpen} onOpenChange={SetProjectOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="project-name" className="text-sm font-medium text-gray-700">
              Project Name
            </label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
            />
          </div>

          <Button onClick={handleCreateProject} className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

