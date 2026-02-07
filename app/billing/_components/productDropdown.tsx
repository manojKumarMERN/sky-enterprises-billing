import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectSeparator,
} from "@/components/ui/select";

const ITEMS_BY_CATEGORY = {
  "Wooden Boards": [
    { id: "woodBoard1", name: "Marine Plywood (BWR/BWP)", price: 3500 },
    { id: "woodBoard2", name: "HDF-HMR", price: 3000 },
    { id: "woodBoard3", name: "MDF", price: 2500 },
    { id: "woodBoard5", name: "Particle Board", price: 1500 },
  ],
  Finishes: [
    { id: "finish1", name: "Laminate (Matte/Gloss)", price: 800 },
    { id: "finish2", name: "Acrylic High Gloss", price: 2500 },
    { id: "finish3", name: "Veneer (Natural Wood)", price: 2200 },
    { id: "finish4", name: "Lacquer / PU Paint", price: 1800 },
    { id: "finish5", name: "Glass (Lacquered / Frosted)", price: 3000 },
  ],
  Hardware: [
    { id: "hardware1", name: "Cabinet Handles (Aluminium)", price: 250 },
    { id: "hardware2", name: "Cabinet Handles (SS / Brass)", price: 400 },
    { id: "hardware3", name: "Soft Close Hinges", price: 120 },
    { id: "hardware4", name: "Drawer Channels (Soft Close Rollers)", price: 900 },
    { id: "hardware5", name: "Tandem Box Drawer System", price: 4500 },
  ],
  "Bed Hardware": [
    { id: "bedHardware1", name: "Hydraulic Bed Lift Mechanism (Single)", price: 4500 },
    { id: "bedHardware2", name: "Hydraulic Bed Lift Mechanism (Double)", price: 8500 },
    { id: "bedHardware3", name: "Bed Storage Rollers", price: 300 },
    { id: "bedHardware4", name: "Heavy Duty Bed Hinges", price: 600 },
  ],
};

export default function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const categories = Object.entries(ITEMS_BY_CATEGORY);

  return (
    <Select value={value} onValueChange={onChange}>
     <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a Product" />
      </SelectTrigger>
      <SelectContent>
        {categories.map(([category, items], index) => (
          <div key={category}>
            <SelectGroup>
              <SelectLabel>{category}</SelectLabel>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
            {index < categories.length - 1 && <SelectSeparator />}
          </div>
        ))}

        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="other">Other</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
