import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { SubscribeButton } from "@/components/SubscribeButton";

export default function SubscribePage() {
  return (
    <div>
      <div className="flex items-center justify-center gap-4 p-4 md:pt-20">
        <SubscribeButton label="Monthly" type="pro-month" />
        <SubscribeButton label="Annually" type="pro-year" />
      </div>

      <div className="flex items-center justify-center gap-4 p-4 md:pt-20">
        <ManageSubscriptionButton />
      </div>
    </div>
  );
}
