import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/app-sidebar";
import DashboardNav from "@/components/DashboardNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Mobilesidebar from "@/components/Mobile-sidebar";
import { Outlet } from "react-router-dom";

import { CreateProjectDialog } from "@/components/CreateProject";
import { InviteModel } from "@/components/InviteModel";
import { CreateTask } from "@/components/CreateTask";

const DashboardLayout = () => {
    const isMobile = useIsMobile();

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
                {!isMobile && (
                    <div className="w-64 flex-shrink-0">
                        <DashboardSidebar />
                    </div>
                )}

                {isMobile && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 left-4 z-50 focus-visible:ring-0"
                            >
                                <div className="flex items-center h-8 px-1 rounded-md bg-white border border-slate-200 shadow-sm">
                                    <i className="bi bi-list text-slate-600 text-lg"></i>
                                </div>
                            </Button>
                        </SheetTrigger>

                        <SheetContent
                            side="left"
                            className="p-0 w-64 !h-screen !max-h-screen overflow-y-auto bg-white border-r-0"
                        >
                            <Mobilesidebar />
                        </SheetContent>
                    </Sheet>
                )}

                <div className="flex flex-col flex-1 min-w-0">
                    <DashboardNav />
                    <main className="flex-1 overflow-y-auto bg-white/50">
                        <Outlet />
                    </main>
                </div>
            </div>
            
            <CreateProjectDialog />
            <InviteModel />
            <CreateTask />
        </SidebarProvider>
    );
};


export default DashboardLayout;
