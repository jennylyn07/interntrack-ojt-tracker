// File: src/app/dashboard/profile/page.js
// Purpose: Redirect to the new internship management page.
//
// This route was retired in Stage 2 when single-internship editing was replaced
// with per-ID editing at /dashboard/internships/[id]/edit.
// The redirect keeps any existing bookmarks from 404-ing.

import { redirect } from "next/navigation";

export default function ProfileRedirectPage() {
  redirect("/dashboard/internships");
}