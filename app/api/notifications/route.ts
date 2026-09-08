import { NextResponse } from "next/server";
import { getMyNotifications } from "@/app/lib/queries/notifications";

export async function GET() {
  return NextResponse.json(await getMyNotifications());
}
