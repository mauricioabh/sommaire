"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromGemini } from "@/lib/geminiai";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { revalidatePath } from "next/cache";

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfSummary(
  uploadResponse: [
    {
      serverData: {
        userId: string;
        file: {
          url: string;
          name: string;
        };
      };
    }
  ]
) {
  console.log("ENTRA A ESTA MMD");
  if (!uploadResponse) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }

  console.log("UPLOAD RESPONSE: ", uploadResponse);

  const first = uploadResponse[0];
  const serverData = first?.serverData;
  const pdfUrl = serverData?.file?.url ?? (first as { url?: string })?.url;
  const fileName = serverData?.file?.name ?? (first as { name?: string })?.name ?? "document.pdf";

  if (!pdfUrl) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }

  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    console.log({ pdfText });

    let summary;
    try {
      summary = await generateSummaryFromGemini(pdfText);
    } catch (error) {
      console.error("Gemini API failed after quote exceeded");
      throw new Error("Failed to generate summary with available AI providers");
    }

    if (!summary) {
      return {
        success: false,
        message: "Failed to generate summary",
        data: null,
      };
    }

    const formattedFileName = formatFileNameAsTitle(fileName);

    return {
      success: true,
      message: "Summary generated successfully",
      data: {
        title: fileName,
        summary,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }
}

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  try {
    const sql = await getDbConnection();
    const result = await sql`
      INSERT INTO
        pdf_summaries(user_id, original_file_url, summary_text, title, file_name)
      VALUES (${userId}, ${fileUrl}, ${summary}, ${title}, ${fileName})
      RETURNING id
    `;
    return result[0]; // o result si quieres todo el array
  } catch (error) {
    console.log("Error saving PDF summary, error");
    throw error;
  }
}

export async function storePdfSummaryAction({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  // User is logged in and has a userid
  // savePdfSummary
  //savePdfSummary()
  let savedSummary: any;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not found",
      };
    }
    savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });
    console.log("SAVED SUMMARY: ", savedSummary);
    if (!savedSummary) {
      return {
        success: false,
        message: "Failed to save PDF summary, please try again...",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error saving PDF summary",
    };
  }

  //Revalidate our cache
  revalidatePath(`/summaries/${savedSummary.id}`);

  return {
    success: true,
    message: "PDF summary saved successfully",
    data: {
      id: savedSummary.id,
    },
  };
}
