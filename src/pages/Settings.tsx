import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/context";

const Settings = () => {
    const { user } = useAppContext();

    return (
        <div className="p-6 space-y-8 h-full overflow-y-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-muted-foreground italic">Manage your account and preferences.</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-medium text-slate-700 mb-1" htmlFor="name">Full Name</label>
                            <Input id="name" defaultValue={user?.name} />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email</label>
                            <Input id="email" defaultValue={user?.email} disabled />
                        </div>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">Save Changes</Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>Your current access level in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-700">Access Role</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                {user?.role || 'MEMBER'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
