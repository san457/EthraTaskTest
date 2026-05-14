import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAppContext } from '@/context/context';

interface Member {
  id: string;

  name: string;
  email: string;
  role: string;
}

export default function ProjectMembersContainer({ }: any) {
  const [members, setMembers] = useState<Member[]>([]);
  const { SelectProject, SetInviteOpen } = useAppContext()

  useEffect(() => {
    const fetchMembers = async () => {
      if (!SelectProject) return;

      try {
        const res = await api.get(`/projects/members/${SelectProject.id}`);

        setMembers(res.data.members || []);
      } catch (err) {
        console.error('Error fetching project members:', err);
      }
    };

    fetchMembers();
  }, [SelectProject]);

  if (!SelectProject) {
    return (
      <div className="w-full lg:w-1/2 h-[50vh] bg-white shadow-sm rounded-2xl scroll-none border p-4 flex items-center justify-center text-gray-500">
        Select a project to view its members
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 h-[50vh] bg-white shadow-sm rounded-2xl scroll-none border p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Project Members</h2>
       <i className="text-2xl bi bi-person-add cursor-pointer" onClick={() => SetInviteOpen(true)}></i>
      </div>
      {members.length === 0 ? (
        <p className="text-sm text-gray-400">No members in this project.</p>
      ) : (
        members.map((member) => {
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={member.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-bold">
                {initials}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                <p className="text-xs text-gray-500">{member.email} • <span className="capitalize">{member.role}</span></p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

