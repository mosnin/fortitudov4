"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Reply, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  userName: string;
  role: "client" | "admin";
  content: string;
  createdAt: string;
  replies: Comment[];
}

const demoComments: Comment[] = [
  {
    id: "1",
    userName: "Fortitudo Team",
    role: "admin",
    content: "The homepage hero section is ready for review. Let us know your thoughts on the layout and CTA placement.",
    createdAt: "Mar 18, 2026 10:00 AM",
    replies: [
      {
        id: "1-1",
        userName: "You",
        role: "client",
        content: "Looks great! Can we make the CTA button larger and more prominent?",
        createdAt: "Mar 18, 2026 2:30 PM",
        replies: [],
      },
      {
        id: "1-2",
        userName: "Fortitudo Team",
        role: "admin",
        content: "Sure! I'll bump it up to a larger size with more padding. Will push the update today.",
        createdAt: "Mar 18, 2026 3:15 PM",
        replies: [],
      },
    ],
  },
  {
    id: "2",
    userName: "You",
    role: "client",
    content: "For the product catalog page, can we add a grid/list view toggle? Some customers prefer a compact view.",
    createdAt: "Mar 19, 2026 9:00 AM",
    replies: [],
  },
];

function CommentItem({
  comment,
  depth = 0,
}: {
  comment: Comment;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 pl-4 border-l-2 border-border")}>
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold",
              comment.role === "admin"
                ? "bg-orange/10 text-orange"
                : "bg-muted text-muted-foreground"
            )}
          >
            {comment.userName[0]}
          </div>
          <span className="text-sm font-medium">{comment.userName}</span>
          {comment.role === "admin" && (
            <span className="text-[10px] bg-orange/10 text-orange px-1.5 py-0.5 rounded-full font-medium">
              Team
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {comment.createdAt}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{comment.content}</p>
        <button
          onClick={() => setReplyOpen(!replyOpen)}
          className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Reply className="h-3 w-3" />
          Reply
        </button>

        {replyOpen && (
          <div className="mt-3 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="text-sm"
            />
            <Button
              size="sm"
              disabled={!replyText.trim()}
              onClick={() => {
                setReplyText("");
                setReplyOpen(false);
              }}
              className="shrink-0 self-end"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ProjectComments() {
  const [newComment, setNewComment] = useState("");

  return (
    <div className="space-y-4">
      {/* New comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment or annotation..."
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end">
          <Button disabled={!newComment.trim()} onClick={() => setNewComment("")}>
            <MessageCircle className="mr-1 h-4 w-4" />
            Comment
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {demoComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
