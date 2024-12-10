"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

interface YoutubeLink {
  id: number;
  title: string;
  url: string;
}

export default function YoutubeLinks({
  youtubeLinks,
}: {
  youtubeLinks: YoutubeLink[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const { mutate: addLink } = api.youtube.addLink.useMutation({
    onSuccess: () => {
      toast.success("Link added!");
      setTitle("");
      setUrl("");
      router.refresh();
    },
    onError: () => {
      toast.error("Something went wrong while adding the link");
    },
  });
  const { mutate: deleteLink } = api.youtube.deleteLink.useMutation({
    onSuccess: () => router.refresh(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && url) {
      addLink({ title, url });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                required
                type="url"
                pattern="https?://.*"
              />
            </div>
          </div>
          <Button type="submit">Add Link</Button>
        </form>
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">YouTube Links</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {youtubeLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell>{link.title}</TableCell>
                <TableCell>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {link.url}
                  </a>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteLink({ id: link.id })}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
