import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role_id !== 1) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">Forbidden</p>;
  }
  return children;
}
