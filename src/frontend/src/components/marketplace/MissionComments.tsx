import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth-store";
import { useCommentStore } from "@/lib/comment-store";
import type { Comment, Reply as ReplyType } from "@/lib/comment-store";
import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  de as deLocale,
  enUS,
  es as esLocale,
  fr as frLocale,
  it as itLocale,
  nl as nlLocale,
  pt as ptLocale,
} from "date-fns/locale";
import { Heart, MessageCircle, Reply } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function getDateLocale(lang: string) {
  switch (lang) {
    case "fr":
    case "ie":
      return frLocale;
    case "de":
      return deLocale;
    case "es":
      return esLocale;
    case "it":
      return itLocale;
    case "pt":
      return ptLocale;
    case "nl":
      return nlLocale;
    default:
      return enUS;
  }
}

function roleColor(role: string) {
  if (role === "pro") return "bg-amber-500";
  if (role === "admin") return "bg-rose-500";
  return "bg-blue-500";
}

function timeAgoStr(date: Date, lang: string) {
  try {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: getDateLocale(lang),
    });
  } catch {
    return "";
  }
}

// ─── Single reply ─────────────────────────────────────────────────────────────

function ReplyItem({
  reply,
  commentId,
  userId,
  lang,
}: {
  reply: ReplyType;
  commentId: string;
  userId: number | null;
  lang: string;
}) {
  const { toggleReplyLike } = useCommentStore();
  const liked = userId !== null && reply.likedBy.includes(userId);

  return (
    <div className="flex gap-2.5 ml-8 mt-2">
      <div
        className={`shrink-0 h-7 w-7 rounded-full ${roleColor(reply.authorRole)} flex items-center justify-center text-white text-[10px] font-bold`}
      >
        {reply.authorName.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-foreground">
              {reply.authorName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {timeAgoStr(reply.createdAt, lang)}
            </span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            {reply.content}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            userId !== null && toggleReplyLike(commentId, reply.id, userId)
          }
          className={`mt-1 flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full transition-colors ${
            liked
              ? "text-rose-500 font-medium"
              : "text-muted-foreground hover:text-rose-400"
          }`}
          data-ocid="comments.reply.toggle"
        >
          <Heart className={`h-3 w-3 ${liked ? "fill-rose-500" : ""}`} />
          {reply.likes > 0 && <span>{reply.likes}</span>}
        </button>
      </div>
    </div>
  );
}

// ─── Single comment ───────────────────────────────────────────────────────────

function CommentItem({
  comment,
  userId,
  lang,
  ct,
  isVerified,
}: {
  comment: Comment;
  userId: number | null;
  lang: string;
  ct: Record<string, string>;
  isVerified: boolean;
}) {
  const { toggleCommentLike } = useCommentStore();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const liked = userId !== null && comment.likedBy.includes(userId);

  function handleLike() {
    if (userId === null) {
      toast.error(ct.loginToComment);
      return;
    }
    toggleCommentLike(comment.id, userId);
  }

  return (
    <div className="flex gap-2.5">
      <Avatar className={`shrink-0 h-8 w-8 ${roleColor(comment.authorRole)}`}>
        <AvatarFallback
          className={`${roleColor(comment.authorRole)} text-white text-xs font-bold`}
        >
          {comment.authorName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">
              {comment.authorName}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                comment.authorRole === "pro"
                  ? "bg-amber-100 text-amber-700"
                  : comment.authorRole === "admin"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {comment.authorRole}
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {timeAgoStr(comment.createdAt, lang)}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 pl-1">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full transition-colors ${
              liked
                ? "text-rose-500 font-medium"
                : "text-muted-foreground hover:text-rose-400"
            }`}
            data-ocid="comments.comment.toggle"
          >
            <Heart className={`h-3 w-3 ${liked ? "fill-rose-500" : ""}`} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          {isVerified && (
            <button
              type="button"
              onClick={() => setShowReplyBox((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded-full"
              data-ocid="comments.reply.button"
            >
              <Reply className="h-3 w-3" />
              {ct.reply}
            </button>
          )}
        </div>

        {/* Reply box */}
        {showReplyBox && (
          <ReplyBox
            commentId={comment.id}
            onClose={() => setShowReplyBox(false)}
            ct={ct}
            lang={lang}
          />
        )}

        {/* Replies */}
        {comment.replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            commentId={comment.id}
            userId={userId}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Reply box ────────────────────────────────────────────────────────────────

function ReplyBox({
  commentId,
  onClose,
  ct,
  lang: _lang,
}: {
  commentId: string;
  onClose: () => void;
  ct: Record<string, string>;
  lang: string;
}) {
  const { addReply } = useCommentStore();
  const { currentUser } = useAuthStore();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (!text.trim() || !currentUser) return;
    setSubmitting(true);
    const result = addReply(commentId, currentUser as any, text.trim());
    setSubmitting(false);
    if (result.valid) {
      onClose();
    } else {
      toast.error(ct.modBlocked, { description: ct.modReason });
    }
  }

  return (
    <div className="mt-2 ml-0 space-y-2" data-ocid="comments.reply.panel">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`${ct.replyTo}...`}
        className="text-sm min-h-[60px] resize-none"
        data-ocid="comments.reply.textarea"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          className="h-7 text-xs"
          data-ocid="comments.reply.submit_button"
        >
          {ct.publish}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-7 text-xs"
          data-ocid="comments.reply.cancel_button"
        >
          {ct.cancel}
        </Button>
      </div>
    </div>
  );
}

// ─── Main MissionComments component ──────────────────────────────────────────

export function MissionComments({ missionId }: { missionId: string }) {
  const { t, lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const { getComments, addComment } = useCommentStore();
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const comments = getComments(missionId);
  const ct = t.comments as Record<string, string>;

  const isLoggedIn = currentUser !== null;
  // All demo users are considered verified
  const isVerified = isLoggedIn;

  function handleSubmit() {
    if (!newComment.trim() || !currentUser) return;
    setSubmitting(true);
    const result = addComment(missionId, currentUser as any, newComment.trim());
    setSubmitting(false);
    if (result.valid) {
      setNewComment("");
    } else {
      toast.error(ct.modBlocked, { description: ct.modReason });
    }
  }

  return (
    <div className="border-t border-border/30 mt-0">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        data-ocid="comments.toggle.button"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span>
          {comments.length} {ct.toggle}
        </span>
        <span className="ml-auto text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {/* Comments panel */}
      {open && (
        <div className="px-4 pb-4 space-y-4" data-ocid="comments.panel">
          {/* Comment list */}
          {comments.length === 0 ? (
            <p
              className="text-xs text-muted-foreground text-center py-3"
              data-ocid="comments.empty_state"
            >
              {ct.noComments}
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment, idx) => (
                <div
                  key={comment.id}
                  data-ocid={`comments.comment.item.${idx + 1}`}
                >
                  <CommentItem
                    comment={comment}
                    userId={currentUser?.id ?? null}
                    lang={lang}
                    ct={ct}
                    isVerified={isVerified}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          {!isLoggedIn ? (
            <p
              className="text-xs text-muted-foreground"
              data-ocid="comments.login_state"
            >
              <Link
                to="/login"
                className="text-primary hover:underline"
                data-ocid="comments.login.link"
              >
                {ct.loginToComment}
              </Link>
            </p>
          ) : !isVerified ? (
            <p
              className="text-xs text-muted-foreground"
              data-ocid="comments.verified_state"
            >
              {ct.verifiedOnly}
            </p>
          ) : (
            <div className="space-y-2 pt-1" data-ocid="comments.add.panel">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={ct.addComment}
                className="text-sm min-h-[72px] resize-none"
                data-ocid="comments.add.textarea"
              />
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting}
                className="h-8 text-xs"
                data-ocid="comments.add.submit_button"
              >
                {ct.publish}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
