import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

//const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  
  pdfUploader: f({ pdf: { maxFileSize: '32MB' }})
  .middleware(async ({ req }) => {
    // get user info
    const user = await currentUser();
    if(!user) {
        throw new UploadThingError('Unauthorized')
    }
    return { userId: user.id}
  })
  .onUploadComplete(async({metadata, file}) => {
    console.log('upload completed for user id', metadata.userId)
    console.log('file url', file.ufsUrl)
    return { userId: metadata.userId, file: { url: file.ufsUrl, name: file.name }}
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
