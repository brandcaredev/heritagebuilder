import "server-only";
import { env } from "@/env";
import { createConnection, type Socket } from "node:net";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";

export type EmailMessage = {
  from: string;
  to: string | string[];
  replyTo?: string | string[];
  subject: string;
  html: string;
};

type SMTPWaiter = {
  resolve: (line: string) => void;
  reject: (error: Error) => void;
};

class InbucketSMTPConnection {
  private buffer = "";
  private lines: string[] = [];
  private waiters: SMTPWaiter[] = [];
  private failure: Error | null = null;

  constructor(private readonly socket: Socket) {
    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => {
      this.buffer += chunk;
      let boundary = this.buffer.indexOf("\r\n");
      while (boundary !== -1) {
        const line = this.buffer.slice(0, boundary);
        this.buffer = this.buffer.slice(boundary + 2);
        const waiter = this.waiters.shift();
        if (waiter) waiter.resolve(line);
        else this.lines.push(line);
        boundary = this.buffer.indexOf("\r\n");
      }
    });
    socket.on("error", (error) => this.fail(error));
    socket.on("close", () =>
      this.fail(new Error("Inbucket SMTP connection closed unexpectedly.")),
    );
  }

  private fail(error: Error) {
    if (this.failure) return;
    this.failure = error;
    for (const waiter of this.waiters.splice(0)) waiter.reject(error);
  }

  private nextLine() {
    if (this.lines.length) return Promise.resolve(this.lines.shift()!);
    if (this.failure) return Promise.reject(this.failure);
    return new Promise<string>((resolve, reject) => {
      this.waiters.push({ resolve, reject });
    });
  }

  async readReply() {
    const lines: string[] = [];
    while (true) {
      const line = await this.nextLine();
      lines.push(line);
      const finalLine = /^(\d{3}) /.exec(line);
      if (finalLine) return { code: Number(finalLine[1]), lines };
    }
  }

  async expectReply(allowedCodes: number[]) {
    const reply = await this.readReply();
    if (!allowedCodes.includes(reply.code)) {
      throw new Error(
        `Inbucket SMTP returned ${reply.code}: ${reply.lines.join(" | ")}`,
      );
    }
  }

  async command(command: string, allowedCodes: number[]) {
    this.socket.write(`${command}\r\n`);
    await this.expectReply(allowedCodes);
  }
}

const toArray = (addresses: string | string[]) =>
  Array.isArray(addresses) ? addresses : [addresses];

const getMailbox = (value: string) => {
  const match = /<([^<>]+)>/.exec(value);
  const mailbox = (match?.[1] ?? value).trim();
  if (!/^[^\s@<>]+@[^\s@<>]+$/.test(mailbox)) {
    throw new Error("Invalid email address for local SMTP delivery.");
  }
  return mailbox;
};

const safeHeader = (value: string) => {
  if (/[\r\n]/.test(value)) {
    throw new Error("Email headers cannot contain line breaks.");
  }
  return value;
};

const sendToInbucket = async (message: EmailMessage) => {
  const sender = getMailbox(message.from);
  const recipients = toArray(message.to).map(getMailbox);
  const replyTo = message.replyTo
    ? toArray(message.replyTo).map(getMailbox).join(", ")
    : undefined;
  const socket = createConnection({
    host: env.INBUCKET_SMTP_HOST,
    port: env.INBUCKET_SMTP_PORT,
  });
  socket.setTimeout(10_000, () =>
    socket.destroy(new Error("Inbucket SMTP connection timed out.")),
  );

  await new Promise<void>((resolve, reject) => {
    const onConnect = () => {
      socket.off("error", onError);
      resolve();
    };
    const onError = (error: Error) => {
      socket.off("connect", onConnect);
      reject(error);
    };
    socket.once("connect", onConnect);
    socket.once("error", onError);
  });

  const smtp = new InbucketSMTPConnection(socket);
  try {
    await smtp.expectReply([220]);
    await smtp.command("EHLO heritagebuilder.local", [250]);
    await smtp.command(`MAIL FROM:<${sender}>`, [250]);
    for (const recipient of recipients) {
      await smtp.command(`RCPT TO:<${recipient}>`, [250, 251]);
    }
    await smtp.command("DATA", [354]);

    const subject = `=?UTF-8?B?${Buffer.from(message.subject, "utf8").toString("base64")}?=`;
    const headers = [
      `From: ${safeHeader(message.from)}`,
      `To: ${recipients.join(", ")}`,
      ...(replyTo ? [`Reply-To: ${safeHeader(replyTo)}`] : []),
      `Subject: ${subject}`,
      `Message-ID: <${randomUUID()}@heritagebuilder.local>`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
    ];
    const body = message.html
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => (line.startsWith(".") ? `.${line}` : line))
      .join("\r\n");
    socket.write(`${headers.join("\r\n")}\r\n\r\n${body}\r\n.\r\n`);
    await smtp.expectReply([250]);
    await smtp.command("QUIT", [221]);
    socket.end();
  } catch (error) {
    socket.destroy();
    throw error;
  }
};

export const sendEmail = async (message: EmailMessage) => {
  if (env.NODE_ENV !== "production") {
    await sendToInbucket(message);
    return;
  }

  const { error } = await new Resend(env.RESEND_API_KEY).emails.create(message);
  if (error) throw new Error(error.message);
};
