import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createServiceSupabase } from "@/lib/supabase-admin";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_VIDEOS = new Set(["video/mp4", "video/webm"]);

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const context = form.get("context")?.toString() ?? "product";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = ALLOWED_VIDEOS.has(file.type);
    const isImage = ALLOWED_IMAGES.has(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF images or MP4/WebM videos are allowed" },
        { status: 400 },
      );
    }

    if (isVideo && context !== "homepage") {
      return NextResponse.json(
        { error: "Video uploads are only allowed for homepage content" },
        { status: 400 },
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo ? "Video must be under 15MB" : "Image must be under 8MB",
        },
        { status: 400 },
      );
    }

    const supabase = createServiceSupabase();
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_VIDEO_BYTES,
      });
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      (isVideo ? "mp4" : "jpg");
    const folder = context === "homepage" ? "marketing" : "products";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Upload failed" },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to upload" },
      { status: 500 },
    );
  }
}
