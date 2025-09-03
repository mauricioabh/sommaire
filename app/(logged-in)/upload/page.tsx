import UploadForm from "@/components/upload/upload-form";
import UploadHeader from "@/components/upload/upload-header";
import { hasReachedUploadLimit } from "@/utils/user";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const maxDuration = 60;

export default async function Page() {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/sign-in");
  }

  const userId = user.id;

  const { hasReachedLimit, uploadLimit } = (await hasReachedUploadLimit(
    userId
  )) || { hasReachedLimit: false, uploadLimit: 0 };

  if (hasReachedLimit) {
    return redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <UploadHeader></UploadHeader>
        <UploadForm></UploadForm>
      </div>
    </div>
  );
}
