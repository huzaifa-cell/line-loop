import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin" && role !== "staff") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path } = await params;
  const decodedPath = decodeURIComponent(path.join("/"));
  
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from('payment-screenshots')
    .createSignedUrl(decodedPath, 60); // 60 seconds

  if (error || !data) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
