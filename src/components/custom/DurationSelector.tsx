import React from 'react'
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useOrderFormStore } from "@/stores/order-form-store";


const durationMap = {
    m: "Minutes",
    h: "Hours",
    d: "Days",
    w: "Weeks",
};

export default function DurationSelector() {
    const [durationQty, setDurationQty] = React.useState<number>(1);
    const [durationUnit, setDurationUnit] = React.useState<keyof typeof durationMap>("m");
    const { setExpirationDate } = useOrderFormStore();
    
    const handleDurationChange = (durationQty: number, durationUnit: string) => {
      const now = new Date();
      const multiplier = {
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
      }[durationUnit];
      setExpirationDate(new Date(now.getTime() + durationQty * multiplier));
    };
  
    React.useEffect(()=>{
      handleDurationChange(durationQty,durationUnit);
    },[durationQty,durationUnit]);
  
    return (
      <div className="flex items-center w-full">
        <div className="relative flex items-center border rounded-md overflow-hidden">
          <Input
            type="number"
            id="duration-time-qty"
            placeholder="1"
            className="border-0 focus:ring-0 rounded-none "
            value={durationQty}
            onChange={(e) => setDurationQty(Number(e.target.value))}
          />
          <Select defaultValue="m" onValueChange={(value) => setDurationUnit(value as keyof typeof durationMap)}>
            <SelectTrigger className="rounded-none bg-white/30 border-0 focus:ring-0">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(durationMap).map((key) => (
                <SelectItem key={key} value={key}>
                  {durationMap[key as keyof typeof durationMap]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
}
