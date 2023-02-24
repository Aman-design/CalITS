import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

import { fallBackHex, isValidHexCode } from "@calcom/lib/CustomBranding";

export type ColorPickerProps = {
  defaultValue: string;
  onChange: (text: string) => void;
};

const ColorPicker = (props: ColorPickerProps) => {
  const init = !isValidHexCode(props.defaultValue)
    ? fallBackHex(props.defaultValue, false)
    : props.defaultValue;
  const [color, setColor] = useState(init);

  return (
    <div className=" mt-1 flex items-center justify-center">
      <Popover.Root>
        <div className="flex h-[38px] w-10 items-center items-center justify-center rounded-l-md border border-r-0 border-gray-300">
          <Popover.Trigger asChild>
            <button
              className="h-5 w-5 rounded-sm"
              aria-label="pick colors"
              style={{ backgroundColor: color }}
            />
          </Popover.Trigger>
        </div>
        <Popover.Portal>
          <Popover.Content align="center" sideOffset={10}>
            <HexColorPicker
              color={color}
              className="pointer-events-auto !h-32 !w-32"
              onChange={(val) => {
                setColor(val);
                props.onChange(val);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <HexColorInput
        className="block w-full border border-gray-300 px-3 py-2  ltr:rounded-r-md rtl:rounded-l-md sm:text-sm"
        color={color}
        onChange={(val) => {
          setColor(val);
          props.onChange(val);
        }}
        type="text"
      />
    </div>
  );
};

export default ColorPicker;
