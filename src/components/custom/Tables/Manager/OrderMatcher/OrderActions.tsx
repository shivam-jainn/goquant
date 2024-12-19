import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Edit } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface OrderActionsProps {
  onEdit: () => void;
  onMatch: () => void;
  onCancel: () => void;
  type: 'buy' | 'sell';
}

export default function OrderActions({ onEdit, onMatch, onCancel, type }:OrderActionsProps){
  return (
    <div className="flex justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-9 h-9 bg-blue-600/10 hover:bg-blue-600 border-blue-600"
              onClick={onEdit}
            >
              <Edit size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Order</TooltipContent>
        </Tooltip>

        {type === 'buy' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-9 h-9 bg-green-600/10 hover:bg-green-600 border-green-600"
              onClick={onMatch}
            >
              <ExternalLink size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Match Order</TooltipContent>
        </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-9 h-9 bg-red-600/10 hover:bg-red-600 border-red-600"
              onClick={onCancel}
            >
              <X size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel Order</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};