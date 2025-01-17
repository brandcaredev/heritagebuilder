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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface YoutubeLink {
  id: number;
  title: string;
  url: string;
  sort?: number | null;
}

export default function YoutubeLinks({
  youtubeLinks: initialYoutubeLinks,
}: {
  youtubeLinks: YoutubeLink[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [youtubeLinks, setYoutubeLinks] = useState(initialYoutubeLinks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const { mutate: updateLink } = api.youtube.updateLink.useMutation({
    onSuccess: (newLink) => {
      toast.success(t("admin.youtube.updateSuccess"));
      if (newLink) {
        setYoutubeLinks((prev) =>
          prev.map((prevLink) =>
            prevLink.id !== editingId ? prevLink : newLink,
          ),
        );
      }
      setEditingId(null);
      router.refresh();
    },
    onError: () => {
      toast.error(t("admin.youtube.error"));
    },
  });

  const { mutate: updateOrder } = api.youtube.updateOrder.useMutation({
    onSuccess: () => {
      toast.success(t("admin.youtube.orderSuccess"));
      setHasChanges(false);
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

  const handleEdit = (link: YoutubeLink) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const handleSaveEdit = (id: number) => {
    if (editTitle && editUrl) {
      updateLink({ id, title: editTitle, url: editUrl });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setYoutubeLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  };

  const handleSaveOrder = () => {
    updateOrder(
      youtubeLinks.map((link, index) => ({
        id: link.id,
        sort: index,
      })),
    );
  };

  function SortableTableRow({
    link,
    onEdit,
  }: {
    link: YoutubeLink;
    onEdit: (link: YoutubeLink) => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: link.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const { mutate: deleteLink } = api.youtube.deleteLink.useMutation({
      onSuccess: () => {
        toast.success("Video deleted successfully");
        window.location.reload();
      },
    });

    return (
      <TableRow ref={setNodeRef} style={style}>
        <TableCell {...attributes} {...listeners}>
          ⋮⋮
        </TableCell>
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
        <TableCell className="space-x-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(link)}>
            {t("common.edit")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteLink({ id: link.id })}
          >
            {t("common.delete")}
          </Button>
        </TableCell>
      </TableRow>
    );
  }

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t("admin.youtube.title")}</h2>
          {hasChanges && (
            <Button onClick={handleSaveOrder}>
              {t("admin.youtube.saveOrder")}
            </Button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>{t("admin.youtube.videoTitle")}</TableHead>
                <TableHead>{t("admin.youtube.url")}</TableHead>
                <TableHead>{t("admin.youtube.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={youtubeLinks.map((link) => link.id)}
                strategy={verticalListSortingStrategy}
              >
                {youtubeLinks.map((link) =>
                  editingId === link.id ? (
                    <TableRow key={link.id}>
                      <TableCell></TableCell>
                      <TableCell>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          type="url"
                          pattern="https?://.*"
                        />
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(link.id)}
                        >
                          {t("admin.youtube.save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          {t("admin.youtube.cancel")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <SortableTableRow
                      key={link.id}
                      link={link}
                      onEdit={handleEdit}
                    />
                  ),
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
