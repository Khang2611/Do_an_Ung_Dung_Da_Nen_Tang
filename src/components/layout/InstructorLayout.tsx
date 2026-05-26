import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function InstructorLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="instructor" />
      <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
