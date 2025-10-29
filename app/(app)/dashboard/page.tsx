import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { UserProfile } from "@/components/Auth/UserProfile";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center p-4 md:pt-20">
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
