import { pluralize } from "@/lib/utils";
import {
  SendConfrimation,
  StreamChatMessage,
  StreamChatMessageConfirmation,
} from "@/types/chat";
import { BadgeCheckIcon, Edit3, Mail, Plus, Send, X } from "lucide-react";
import { useState } from "react";
import { Markdown } from "../markdown";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

interface MessageProps {
  message: StreamChatMessage;
  isStreaming: boolean;
  sendConfirmation: (msgId: string, confirmation: SendConfrimation) => void;
}

export function ConfirmEmailSend({
  message,
  isStreaming,
  sendConfirmation,
}: MessageProps) {
  const confirmation = message.content as StreamChatMessageConfirmation;

  // Auto-open edit mode when no approval decision has been made yet
  const [isEditing, setIsEditing] = useState(false);
  const [editedTo, setEditedTo] = useState(normalize(confirmation.args.to));
  const [editedCc, setEditedCc] = useState(normalize(confirmation.args.cc));
  const [editedBcc, setEditedBcc] = useState(normalize(confirmation.args.bcc));
  const [editedSubject, setEditedSubject] = useState(
    confirmation.args.subject || ""
  );
  const [editedBody, setEditedBody] = useState(confirmation.args.body || "");
  const [newToEmail, setNewToEmail] = useState("");
  const [newCcEmail, setNewCcEmail] = useState("");
  const [newBccEmail, setNewBccEmail] = useState("");

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  function normalize(value: unknown): string[] {
    if (!value) return [];
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value;
    return [];
  }

  // Always use edited state for display (removed conditional logic)
  const to = editedTo;
  const cc = editedCc;
  const bcc = editedBcc;
  const subject = editedSubject;
  const body = editedBody;

  const addEmail = (type: "to" | "cc" | "bcc", email: string) => {
    if (!email.trim()) return;

    switch (type) {
      case "to":
        setEditedTo([...editedTo, email.trim()]);
        setNewToEmail("");
        break;
      case "cc":
        setEditedCc([...editedCc, email.trim()]);
        setNewCcEmail("");
        break;
      case "bcc":
        setEditedBcc([...editedBcc, email.trim()]);
        setNewBccEmail("");
        break;
    }
  };

  const removeEmail = (type: "to" | "cc" | "bcc", index: number) => {
    switch (type) {
      case "to":
        setEditedTo(editedTo.filter((_, i) => i !== index));
        break;
      case "cc":
        setEditedCc(editedCc.filter((_, i) => i !== index));
        break;
      case "bcc":
        setEditedBcc(editedBcc.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSend = () => {
    // Check if any field has been edited
    const originalTo = normalize(confirmation.args.to);
    const originalCc = normalize(confirmation.args.cc);
    const originalBcc = normalize(confirmation.args.bcc);
    const originalSubject = confirmation.args.subject || "";
    const originalBody = confirmation.args.body || "";

    const isEdited =
      JSON.stringify(editedTo.sort()) !== JSON.stringify(originalTo.sort()) ||
      JSON.stringify(editedCc.sort()) !== JSON.stringify(originalCc.sort()) ||
      JSON.stringify(editedBcc.sort()) !== JSON.stringify(originalBcc.sort()) ||
      editedSubject !== originalSubject ||
      editedBody !== originalBody;

    const updatedConfirmation = {
      approve: isEdited ? ("edit" as const) : ("accept" as const),
      args: {
        to: editedTo,
        cc: editedCc.length > 0 ? editedCc : undefined,
        bcc: editedBcc.length > 0 ? editedBcc : undefined,
        subject: editedSubject,
        body: editedBody,
      },
    };

    // Set to preview mode after sending
    setIsEditing(false);

    sendConfirmation(message.id, updatedConfirmation);
  };

  const renderEmailList = (
    emails: string[],
    type: "to" | "cc" | "bcc",
    newEmail: string,
    setNewEmail: (email: string) => void
  ) => {
    console.log(`Rendering ${type} emails:`, emails); // Debug log
    return (
      <div className="space-y-2">
        {emails && emails.length > 0
          ? emails.map((email, index) => (
              <div
                key={`${email}-${index}`}
                className="flex items-center space-x-3 group"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={`text-xs ${
                      type === "to"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getInitials(email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm flex-1">{email}</span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={() => removeEmail(type, index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          : !isEditing && (
              <div className="text-sm text-muted-foreground">
                No {type} recipients
              </div>
            )}
        {isEditing && (
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Add email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addEmail(type, newEmail);
                }
              }}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addEmail(type, newEmail)}
              disabled={!newEmail.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-3 max-w-4xl">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <Mail className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>

        <Card className="w-full shadow-none p-0 px-1 border-none bg-transparent">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Confirm Email{" "}
                  {confirmation.approve === true && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-500 text-white dark:bg-blue-600"
                    >
                      <BadgeCheckIcon />
                      Accepted
                    </Badge>
                  )}
                  {confirmation.approve === false && (
                    <Badge className="" variant="destructive">
                      Canceled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Review your message before sending
                </CardDescription>
              </div>
              {confirmation.approve !== true &&
                confirmation.approve !== false &&
                !isStreaming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "Preview" : "Edit"}
                  </Button>
                )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-0">
            {/* Recipients Card */}
            <Card className="shadow-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium">
                  Recipients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      TO
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {pluralize("recipient", to.length)}
                    </span>
                  </div>
                  {renderEmailList(to, "to", newToEmail, setNewToEmail)}
                </div>

                {cc.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          CC
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pluralize("recipient", cc.length)}
                        </span>
                      </div>
                      {renderEmailList(cc, "cc", newCcEmail, setNewCcEmail)}
                    </div>
                  </>
                )}

                {isEditing && cc.length === 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          CC
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pluralize("recipient", cc.length)}
                        </span>
                      </div>
                      {renderEmailList(cc, "cc", newCcEmail, setNewCcEmail)}
                    </div>
                  </>
                )}

                {bcc.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          BCC
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pluralize("recipient", bcc.length)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Hidden
                        </Badge>
                      </div>
                      {renderEmailList(bcc, "bcc", newBccEmail, setNewBccEmail)}
                    </div>
                  </>
                )}

                {isEditing && bcc.length === 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          BCC
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pluralize("recipient", bcc.length)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Hidden
                        </Badge>
                      </div>
                      {renderEmailList(bcc, "bcc", newBccEmail, setNewBccEmail)}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Subject Card */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Subject</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                ) : (
                  <p className="text-sm font-medium">{subject}</p>
                )}
              </CardContent>
            </Card>

            {/* Message Preview Card */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {isEditing ? "Message Content" : "Message Preview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    placeholder="Enter email content"
                    className="min-h-32 text-sm"
                  />
                ) : (
                  <div className="max-h-64 overflow-y-auto p-4 bg-muted rounded-md">
                    <div className="text-sm text-foreground whitespace-pre-wrap font-sans">
                      <Markdown content={body as string} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>

          {confirmation.approve !== true &&
            confirmation.approve !== false &&
            !isStreaming && (
              <CardFooter className="flex-col space-y-3 p-0">
                <div className="flex w-full space-x-3">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleSend}
                    disabled={to.length === 0 || !subject.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      sendConfirmation(message.id, { approve: "deny" })
                    }
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your email will be sent immediately. This action cannot be
                  undone.
                </p>
              </CardFooter>
            )}
        </Card>
      </div>
    </div>
  );
}
