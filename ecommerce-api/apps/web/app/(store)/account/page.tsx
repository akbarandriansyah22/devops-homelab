import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

function roleLabel(roleId: number): string {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "customer";
  return String(roleId);
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <section className="space-y-2 rounded border border-neutral-200 bg-white p-4">
      <h1 className="text-xl font-semibold">Akun</h1>
      <p>Email: {session.email}</p>
      <p>Nama: {session.full_name}</p>
      <p>Role: {roleLabel(session.role_id)}</p>
    </section>
  );
}
