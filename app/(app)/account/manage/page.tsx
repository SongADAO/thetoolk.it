import { AccountSettingsForm } from "@/components/Auth/AccountSettingsForm";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <AccountSettingsForm />
      </div>
    </div>
  );
}
