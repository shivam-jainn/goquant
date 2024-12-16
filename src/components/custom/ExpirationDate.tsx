"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { DateTimePicker } from "./DateTimePicker";
import DurationSelector from "./DurationSelector";

export function ExpirationDate() {
  const [selectedTab, setSelectedTab] = React.useState<"datetime" | "duration">("duration");
  
  return (
    <div>
      <p className="mb-2">Expiration date</p>
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "datetime" | "duration")}>
        <TabsList className="mb-2">
          <TabsTrigger value="duration">Select Duration</TabsTrigger>
          <TabsTrigger value="datetime">Pick Date & Time</TabsTrigger>
        </TabsList>
        <TabsContent value="datetime">
          <DateTimePicker />
        </TabsContent>
        <TabsContent value="duration">
          <DurationSelector />
        </TabsContent>
      </Tabs>
    </div>
  );
}
