"use client";

import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./upload-form-input";
import { z } from "zod";
import {
  generatePdfSummary,
  storePdfSummaryAction,
} from "@/actions/upload-actions";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB"
    )
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});
export default function UploadForm() {
  //const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("si entro al pedo este");
      toast(
        <div>
          <strong>✅ Upload Complete</strong>
          <div>Your PDF has been uploaded successfully!</div>
        </div>
      );
    },
    onUploadError: (err) => {
      console.error("error occurred while uploading", err);
      toast(
        <div>
          <strong>❌ Error occurred while uploading</strong>
          <div>{err.message}</div>
        </div>
      );
    },
    onUploadBegin: (fileName) => {
      console.log("upload has begun for", fileName);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log("submitted");
      setIsLoading(true);

      const formData = new FormData(e.currentTarget);
      const file = formData.get("file") as File;

      //validating the fields
      const validatedFields = schema.safeParse({ file });

      console.log(validatedFields);

      if (!validatedFields.success) {
        toast(
          <div>
            <strong>❌ Something went wrong</strong>
            <div>
              {validatedFields.error.flatten().fieldErrors.file?.[0] ??
                "Invalid file"}
            </div>
          </div>
        );
        setIsLoading(false);
        return;
      }

      //upload the file to uploadthing
      const resp = await startUpload([file]);
      if (!resp) {
        toast(
          <div>
            <strong>❌ Something went wrong</strong>
            <div>Please use a different file</div>
          </div>
        );
        setIsLoading(false);
        return;
      }

      toast(
        <div>
          <strong>📃 Processing PDF</strong>
          <div>Hang tight! Our AI is reading through your document! ✨</div>
        </div>
      );

      //parse pdf using langchain
      console.log("RESP: ", resp);
      const first = resp[0];
      const fileUrl =
        first?.serverData?.file?.url ?? (first as { url?: string })?.url;
      if (!fileUrl) {
        toast(
          <div>
            <strong>❌ Upload incomplete</strong>
            <div>Could not get file URL. Please try again.</div>
          </div>
        );
        setIsLoading(false);
        return;
      }
      const result = await generatePdfSummary([
        {
          serverData: {
            userId: first?.serverData?.userId ?? "",
            file: {
              url: fileUrl,
              name: first?.name ?? file.name,
            },
          },
        },
      ]);
      console.log({ result });

      const { data = null, message = null } = result || {};

      if (!data && message) {
        toast(
          <div>
            <strong>❌ Error</strong>
            <div>{message}</div>
          </div>
        );
      }

      if (data) {
        let storeResult: any;
        toast(
          <div>
            <strong>📄 Saving PDF</strong>
            <div>Hang tight! We are saving your summary! ✨</div>
          </div>
        );

        if (data.summary) {
          storeResult = await storePdfSummaryAction({
            fileUrl,
            summary: data.summary,
            title: data.title,
            fileName: file.name,
          });
          toast(
            <div>
              <strong>✨ Summary generated!</strong>
              <div>Your PDF has been successfully summarized and saved ✨</div>
            </div>
          );
          formRef.current?.reset();
          router.push(`/summaries/${storeResult.data.id}`);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error ocurred", error);
      formRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput
        isLoading={isLoading}
        ref={formRef}
        onSubmit={handleSubmit}
      ></UploadFormInput>
    </div>
  );
}
