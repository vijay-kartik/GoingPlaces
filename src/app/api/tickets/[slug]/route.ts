import { auth, authConfigured, isAllowed } from "@/auth";
import { downloadTicketPdf } from "@/lib/tickets";

// Tickets carry names and PNRs, so the PDF is only ever served to an invited account.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (authConfigured) {
    const session = await auth();
    if (!isAllowed(session?.user?.email)) {
      return new Response("Not found", { status: 404 });
    }
  }

  const { slug } = await params;
  const file = await downloadTicketPdf(slug);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
