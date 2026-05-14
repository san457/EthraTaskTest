import { useState, useEffect } from "react";
import { useAppContext } from "@/context/context";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function Dashboard() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppContext()
    const [stats, setStats] = useState({ projectCount: 0, pendingTasksCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated === false) {
            navigate("/auth/signup");
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/projects/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchStats();
        }
    }, [isAuthenticated]);


    return (
        <div className="px-4 pt-4 pb-8 flex flex-col gap-8 min-h-full">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 italic">
                    Here's what's happening with your projects and tasks today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/projects')}>
                   <h3 className="text-lg font-semibold mb-2">My Projects</h3>
                   <p className="text-3xl font-bold text-blue-600">{loading ? '--' : stats.projectCount}</p>
                   <p className="text-sm text-slate-500 mt-1 italic">Active projects assigned to you</p>
               </div>
               <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/tasks')}>
                   <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
                   <p className="text-3xl font-bold text-amber-500">{loading ? '--' : stats.pendingTasksCount}</p>
                   <p className="text-sm text-slate-500 mt-1 italic">Tasks requiring your attention</p>
               </div>
               {(user?.role === 'ADMIN' || user?.isProjectAdmin) && (
                 <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
                     <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                     <p className="text-3xl font-bold text-emerald-500">View</p>
                     <p className="text-sm text-slate-500 mt-1 italic">Check your performance metrics</p>
                 </div>
               )}

            </div>
        </div>
    );
}

