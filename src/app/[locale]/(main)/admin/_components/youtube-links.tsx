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
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const { mutate: addLink } = api.youtube.addLink.useMutation({
    onSuccess: () => {
      toast.success(t("admin.youtube.addSuccess"));
      setTitle("");
      setUrl("");
      router.refresh();
    },
    onError: () => {
      toast.error(t("admin.youtube.error"));
    },
  });
  const { mutate: deleteLink } = api.youtube.deleteLink.useMutation({
    onSuccess: () => {
      toast.success(t("admin.youtube.deleteSuccess"));
      router.refresh();
    },
    onError: () => {
      toast.error(t("admin.youtube.error"));
    },
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
              <Label htmlFor="title">{t("admin.youtube.videoTitle")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("admin.youtube.videoTitle")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">{t("admin.youtube.url")}</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("admin.youtube.url")}
                required
                type="url"
                pattern="https?://.*"
              />
            </div>
          </div>
          <Button type="submit">{t("admin.youtube.addNew")}</Button>
        </form>
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">
          {t("admin.youtube.title")}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.youtube.videoTitle")}</TableHead>
              <TableHead>{t("admin.youtube.url")}</TableHead>
              <TableHead>{t("admin.youtube.actions")}</TableHead>
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
                    {t("admin.youtube.delete")}
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
