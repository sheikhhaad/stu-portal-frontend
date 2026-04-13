import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm searchParams={searchParams} />
    </Suspense>
  );
}