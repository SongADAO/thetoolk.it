import { PasswordResetForm } from "@/components/Auth/PasswordResetForm";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <PasswordResetForm />
      </div>
    </div>
  );
}
