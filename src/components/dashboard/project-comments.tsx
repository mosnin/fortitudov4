"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { RecordListSkeleton, RowPill } from "@/components/crm";
import { usePolling } from "@/hooks/use-polling";
import { cn } from "@/lib/utils";
import { PRIMARY_PILL, QUIET_LINK } from "@/lib/typography";

interface CommentData {
  id: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
}

interface CommentTree {
  id: string;
  userName: string;
  role: "client" | "admin";
  content: string;
  createdAt: string;
  replies: CommentTree[];
}

interface ProjectCommentsProps {
  projectId: string;
}

function buildTree(comments: CommentData[]): CommentTree[] {
  const map = new Map<string, CommentTree>();
  const roots: CommentTree[] = [];

  // First pass — create nodes
  for (const c of comments) {
    map.set(c.id, {
      id: c.id,
      userName: "User", // We don't have user names from API, will show role
      role: "client",
      content: c.content,
      createdAt: new Date(c.createdAt).toLocaleString(),
      replies: [],
    });
  }

  // Second pass — wire parent/child
  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function CommentItem({
  comment,
  depth = 0,
  projectId,
  onReplyPosted,
}: {
  comment: CommentTree;
  depth?: number;
  projectId: string;
  onReplyPosted: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          content: replyText,
          parentId: comment.id,
        }),
      });
      if (res.ok) {
        setReplyText("");
        setReplyOpen(false);
        onReplyPosted();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <li className={cn(depth > 0 && "ml-6 border-l border-border pl-4")}>
      <div className="py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.userName}
          </span>
          {comment.role === "admin" && <RowPill>Team</RowPill>}
          <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
            {comment.createdAt}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
        <button
          onClick={() => setReplyOpen(!replyOpen)}
          className={cn(QUIET_LINK, "mt-2 cursor-pointer text-xs")}
        >
          {replyOpen ? "Cancel" : "Reply"}
        </button>

        {replyOpen && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="text-sm"
            />
            <div className="flex justify-end">
              <button
                disabled={!replyText.trim() || submitting}
                onClick={handleReply}
                className={cn(
                  PRIMARY_PILL,
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                {submitting ? "Posting…" : "Post reply"}
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              projectId={projectId}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initial fetch + 10s background refresh so team replies appear without a
  // reload (fused polling pattern — no realtime infrastructure).
  const { loading, refetch: fetchComments } = usePolling<CommentData[]>({
    url: `/api/comments?projectId=${projectId}`,
    interval: 10000,
    onUpdate: (data) => {
      if (Array.isArray(data)) setComments(data);
    },
  });

  const handleNewComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          content: newComment,
        }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tree = buildTree(comments);

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
          <button
            disabled={!newComment.trim() || submitting}
            onClick={handleNewComment}
            className={cn(
              PRIMARY_PILL,
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {submitting ? "Posting…" : "Comment"}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <RecordListSkeleton rows={3} />
      ) : tree.length === 0 ? (
        <div className="py-8">
          <p className="text-sm font-medium text-foreground">No comments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave a comment above to start the conversation with the team.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              onReplyPosted={fetchComments}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
