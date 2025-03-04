"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker(props: {
  init: string;
  setDate: (date: Date) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    props.init.length > 0
      ? (() => {
          const [day, month, year] = props.init.split("/");
          return new Date(`${year}-${month}-${day}`);
        })()
      : undefined
  );
  const [open, setOpen] = React.useState(false);

  const setDateHandler = (date: Date | undefined) => {
    if (date) {
      props.setDate(date);
      setDate(date);
    }
    setOpen(false);
  };

  console.debug("date in DatePicker", props.init, date);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDateHandler}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
