import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/context";
import api from "@/lib/api";
import { toast } from "sonner";

const COLORS = ['#6352FB', '#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const { user } = useAppContext();
  const [data, setData] = useState<{
    statusDistribution: any[];
    projectPerformance: any[];
    metrics: { totalTasks: number; totalProjects: number; activeUsers: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && !user?.isProjectAdmin) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/projects/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-full">Loading analytics...</div>;
  }

  if (user?.role !== 'ADMIN' && !user?.isProjectAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-slate-500">Only administrators can view the analytics dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
        <p className="text-slate-500 italic">Monitor project productivity and task completion trends based on real system data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium italic">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics.totalTasks || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium italic">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics.totalProjects || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium italic">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics.activeUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
            <CardDescription>Completed vs Pending tasks per project</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={data?.projectPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#6352FB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Overall Status</CardTitle>
            <CardDescription>Distribution of task statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie
                  data={data?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.statusDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
