"use client";

import dynamic from "next/dynamic";

// AdminPage reads localStorage in a useState initializer (render time, not
// an effect), which would throw on the server — keep it client-only.
const AdminPage = dynamic(() => import("./AdminPage"), { ssr: false });

export default function AdminLoader() {
  return <AdminPage />;
}
