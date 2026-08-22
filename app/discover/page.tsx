// ============================================
// GGLOG — Public Discover (Redirect)
// ============================================
// /discover is redirected to the authenticated
// /dashboard/discover route for the beta.
// ============================================

import { redirect } from "next/navigation";

export default function DiscoverRedirect() {
  redirect("/dashboard/discover");
}
