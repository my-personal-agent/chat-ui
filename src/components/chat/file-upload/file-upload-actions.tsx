"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePlus2Icon, FilesIcon, LayoutGridIcon, Plus } from "lucide-react";

interface FileUploadActionsProps {
  onFileSelect: () => void;
}

export function FileUploadActions({ onFileSelect }: FileUploadActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
          <Plus className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <LayoutGridIcon className="w-4 h-4 mr-2" />
            Add from apps
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>More...</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={onFileSelect}>
          <FilePlus2Icon className="w-4 h-4 text-accent-foreground" />
          Add files
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FilesIcon className="w-4 h-4 text-accent-foreground" />
          Uploaded Files
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
