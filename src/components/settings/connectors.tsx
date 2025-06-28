"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GmailIcon } from "../icons/gmail-icon";
import { GoogleCalendarIcon } from "../icons/google-calendar";
import { GoogleDriveIcon } from "../icons/google-drive";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const connectorsData = {
  gmail: { icon: GmailIcon, text: "Gmail" },
  google_drive: { icon: GoogleDriveIcon, text: "Google Drive" },
  google_calendar: { icon: GoogleCalendarIcon, text: "Google Calendar" },
};

type ConnectorKey = keyof typeof connectorsData;

export function Connectors() {
  const [enabled, setEnabled] = useState<ConnectorKey[]>([]);
  const [fetching, setFetching] = useState(true);

  const pathname = usePathname();
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.href}?settings=true&tab=connectors`);
    }
  }, [pathname]);

  const loadEnabledConnectors = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/settings/connectors");
      const data: { connectors: string[] } = await res.json();

      setEnabled(
        data.connectors.filter((k): k is ConnectorKey => k in connectorsData)
      );
    } catch (err) {
      console.error("Failed to load connectors:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadEnabledConnectors();
  }, []);

  const addConnector = async (connector: string) => {
    try {
      const response = await fetch("/api/settings/connectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connector: connector, currentUri: fullUrl }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Auth initiation failed:", data.error || data);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  // Filter for browseable connectors (those not already enabled)
  const browseable = (Object.keys(connectorsData) as ConnectorKey[]).filter(
    (key) => !enabled.includes(key)
  );

  return (
    <>
      {fetching && (
        <div className="space-y-2 px-4 mt-9">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      )}
      {!fetching && (
        <>
          {enabled.length > 0 && (
            <>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <small className="text-sm leading-none font-medium">
                    Enabled Connectors
                  </small>
                </div>
              </header>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 px-4">
                {enabled.map((key) => {
                  const { icon: Icon, text } = connectorsData[key];
                  return (
                    <Button key={key} variant="outline" className="h-15">
                      <Icon />
                      {text}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <small className="text-sm leading-none font-medium">
                Browse Connectors
              </small>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 px-4">
            {browseable.map((key) => {
              const { icon: Icon, text } = connectorsData[key];
              return (
                <Button
                  key={key}
                  variant="outline"
                  className="h-15"
                  onClick={() => addConnector(key)}
                >
                  <Icon />
                  {text}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
