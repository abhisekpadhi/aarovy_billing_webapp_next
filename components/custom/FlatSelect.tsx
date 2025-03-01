import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { config } from "@/lib/config";
  
export function FlatSelect(props: {
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a flat" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Flats</SelectLabel>
            {config.flats.map((flat) => (
              <SelectItem key={flat} value={flat}>
                {flat}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
  