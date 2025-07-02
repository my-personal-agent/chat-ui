import { pluralize } from "@/lib/utils";
import {
  SendConfrimation,
  StreamChatMessage,
  StreamChatMessageConfirmation,
} from "@/types/chat";
import { BadgeCheckIcon, Mail, Send } from "lucide-react";
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
import { Separator } from "../ui/separator";

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
  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const normalize = (value: unknown): string[] => {
    if (!value) return [];
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value;
    return [];
  };

  const confirmation = message.content as StreamChatMessageConfirmation;

  const to = normalize(confirmation.args.to);
  const cc = normalize(confirmation.args.cc);
  const bcc = normalize(confirmation.args.bcc);
  const subject = confirmation.args.subject || "";
  const body = confirmation.args.body || "";

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
                  <div className="space-y-2">
                    {to.map((email) => (
                      <div key={email} className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {getInitials(email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{email}</span>
                      </div>
                    ))}
                  </div>
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
                      <div className="space-y-2">
                        {cc.map((email) => (
                          <div
                            key={email}
                            className="flex items-center space-x-3"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                {getInitials(email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{email}</span>
                          </div>
                        ))}
                      </div>
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
                      <div className="space-y-2">
                        {bcc.map((email) => (
                          <div
                            key={email}
                            className="flex items-center space-x-3"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                {getInitials(email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{email}</span>
                          </div>
                        ))}
                      </div>
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
                <p className="text-sm font-medium">{subject}</p>
              </CardContent>
            </Card>

            {/* Message Preview Card */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto p-4 bg-muted rounded-md">
                  <div className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    <Markdown content={body as string} />
                  </div>
                </div>
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
                    onClick={() =>
                      sendConfirmation(message.id, { approve: "accept" })
                    }
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
