'use client';

import { useState } from 'react';
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

export function InviteModel() {
  const { InviteOpen, SetInviteOpen, SelectProject } = useAppContext();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !SelectProject?.id) return;

    try {
      setLoading(true);
      const res = await api.post('/projects/invite', {
        projectId: SelectProject.id,
        email,
        role
      });

      toast.success(res.data.message || `Invite sent to ${email}`);
      setEmail('');
      SetInviteOpen(false);
      
      // Refresh members if possible
      // window.fetchMembers?.(); 
    } catch (err: any) {
      console.error('Invite failed:', err);
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={InviteOpen} onOpenChange={SetInviteOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Project</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite to <strong>{SelectProject?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Email Address</label>
            <Input
              placeholder="user@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button
            onClick={handleInvite}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Invite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

