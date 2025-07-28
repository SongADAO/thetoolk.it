import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import UserProfile from "@/components/Auth/UserProfile";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
