"use client";
import { Button, Input } from "@/components/ui";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { mutateAsync: addToNewsletter, isPending } =
    api.user.addToNewsletter.useMutation({
      onSuccess: () => {
        setEmail("");
        toast.success("Subscribed successfully");
      },
    });
  return (
    <div className="flex flex-1 flex-col gap-4 md:items-center md:justify-between">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white-2">Newsletter</h2>
        <p className="text-white-2/80">
          Stay connected! Subscribe to our newsletter for updates on new
          articles, events, and discussions that celebrate our shared heritage.
        </p>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="email"
          placeholder="Enter your email address"
          className="rounded-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
        <Button
          disabled={isPending}
          onClick={async () => await addToNewsletter(email)}
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
}
