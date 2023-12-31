import useSession from "@/hooks/useSession";
import { logout } from "@/lib/actions";

async function Dashboard() {
  const { user } = await useSession();
  return (
    <div>
      <h1>{user?.name}</h1>
      <form action={logout}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}

export default Dashboard;
