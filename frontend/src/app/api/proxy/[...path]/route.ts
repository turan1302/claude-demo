import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { laravelFetch } from "@/lib/server-env";

async function proxy(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const hasBody = !["GET", "HEAD", "DELETE"].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  const laravelResponse = await laravelFetch(`/${path.join("/")}${request.nextUrl.search}`, {
    method: request.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: body || undefined,
  });

  if (laravelResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await laravelResponse.text();

  return new NextResponse(data, {
    status: laravelResponse.status,
    headers: { "Content-Type": laravelResponse.headers.get("Content-Type") ?? "application/json" },
  });
}

type ProxyContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: ProxyContext) {
  return proxy(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: ProxyContext) {
  return proxy(request, (await params).path);
}

export async function PATCH(request: NextRequest, { params }: ProxyContext) {
  return proxy(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: ProxyContext) {
  return proxy(request, (await params).path);
}
