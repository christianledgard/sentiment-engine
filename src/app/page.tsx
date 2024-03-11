import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { CreateFeedback } from "~/app/_components/create-feedback";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  noStore();
  const session = await getServerAuthSession();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-semibold">Feedback Engine</h1>
        <div>
          {session && (
            <span className="mr-4">Logged in as {session.user?.name}</span>
          )}
          <div className="space-x-2">
            <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
              <Button variant="outline">
                {session ? "Sign out" : "Sign in"}
              </Button>
            </Link>
            <Link href={"/admin"}>
              <Button variant="outline">{"Admin"}</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-semibold">Share your Feedback</h1>
          <CreateFeedback />
        </div>
      </main>
    </div>
  );
}
