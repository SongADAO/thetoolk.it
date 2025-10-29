import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { UserProfile } from "@/components/Auth/UserProfile";
import { SubscriptionManager } from "@/components/SubscriptionManager";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center gap-8 p-4 pb-10 md:pt-20">
        <UserProfile />

        <SubscriptionManager />
      </div>
    </ProtectedRoute>
  );
}
