import { SubscribeButton } from "@/components/SubscribeButton";

export default function SubscribePage() {
  return (
    <div className="flex items-center justify-center gap-4 p-4 md:pt-20">
      <SubscribeButton label="Monthly" type="pro-month" />
      <SubscribeButton label="Annually" type="pro-year" />
    </div>
  );
}
