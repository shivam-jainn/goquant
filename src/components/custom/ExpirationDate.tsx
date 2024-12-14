"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { DateTimePicker } from "./DateTimePicker";
import DurationSelector from "./DurationSelector";

export function ExpirationDate() {
  const [selectedTab, setSelectedTab] = React.useState<"datetime" | "duration">("datetime");
  
  return (
    <div>
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "datetime" | "duration")}>
        <TabsList>
          <TabsTrigger value="datetime">Pick Date & Time</TabsTrigger>
          <TabsTrigger value="duration">Select Duration</TabsTrigger>
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
