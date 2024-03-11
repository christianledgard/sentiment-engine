import Link from "next/link";
import { Button } from "~/components/ui/button";
import "~/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-semibold">Feedback Engine</h1>
        <div className="space-x-2">
          <Link href={"/"}>
            <Button variant="outline">Feedback Form</Button>
          </Link>
          <Link href={"/admin"}>
            <Button variant="outline">Results</Button>
          </Link>
          <Link href={"/admin/graph"}>
            <Button variant="outline">Graphs</Button>
          </Link>
        </div>
      </header>
      <div className="container mx-auto mt-8">{children}</div>
    </>
  );
}
