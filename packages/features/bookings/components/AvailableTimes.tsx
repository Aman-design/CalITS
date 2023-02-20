import { useState } from "react";

import dayjs, { Dayjs } from "@calcom/dayjs";
import { Slots } from "@calcom/features/schedules";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { detectBrowserTimeFormat, setIs24hClockInLocalStorage, TimeFormat } from "@calcom/lib/timeFormat";
import { nameOfDay } from "@calcom/lib/weekday";
import { ToggleGroup, Button } from "@calcom/ui";

// @TODO: from old booker:
// * Brand color variable?

type AvailableTimesProps = {
  date: Dayjs;
  slots: Slots[string];
  timezone: string;
  onTimeSelect: (time: string) => void;
  seatsPerTimeslot?: number | null;
};

export const AvailableTimes = ({
  date,
  slots,
  timezone,
  onTimeSelect,
  seatsPerTimeslot,
}: AvailableTimesProps) => {
  const { t, i18n } = useLocale();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(detectBrowserTimeFormat);
  const hasTimeSlots = !!seatsPerTimeslot;
  console.log(slots);
  return (
    <div className="dark:text-white">
      <header className="dark:bg-darkgray-100 dark:before:bg-darkgray-100 sticky top-0 left-0 z-10 mb-6 flex w-full items-center bg-white before:absolute before:-top-8 before:h-8 before:w-full before:bg-white">
        <span className="font-semibold text-gray-900 dark:text-white">
          {nameOfDay(i18n.language, Number(date.format("d")), "short")}
        </span>
        <span className="mr-4">
          , {date.toDate().toLocaleString(i18n.language, { month: "short" })} {date.format(" D ")}
        </span>

        <div className="ml-auto">
          <ToggleGroup
            onValueChange={(newFormat) => {
              setTimeFormat(newFormat as TimeFormat);
              setIs24hClockInLocalStorage(newFormat === TimeFormat.TWENTY_FOUR_HOUR);
            }}
            defaultValue={timeFormat}
            options={[
              { value: TimeFormat.TWELVE_HOUR, label: t("12_hour_short") },
              { value: TimeFormat.TWENTY_FOUR_HOUR, label: t("24_hour_short") },
            ]}
          />
        </div>
      </header>
      <div>
        {slots.map((slot) => {
          const bookingFull = !!(hasTimeSlots && slot.attendees && slot.attendees >= seatsPerTimeslot);
          return (
            <div key={slot.time}>
              <Button
                disabled={bookingFull}
                onClick={() => onTimeSelect(dayjs.utc(slot.time).tz(timezone).format())}
                className="mb-3 block h-auto min-h-[44px] w-full flex-col justify-center py-2"
                color="secondary">
                {dayjs(slot.time).tz(timezone).format(timeFormat)}
                {bookingFull && <p className="text-sm">{t("booking_full")}</p>}
                {hasTimeSlots && !bookingFull && (
                  <p
                    className={`${
                      slot.attendees && slot.attendees / seatsPerTimeslot >= 0.8
                        ? "text-rose-600"
                        : slot.attendees && slot.attendees / seatsPerTimeslot >= 0.33
                        ? "text-yellow-500"
                        : "text-emerald-400"
                    } text-sm`}>
                    {slot.attendees ? seatsPerTimeslot - slot.attendees : seatsPerTimeslot} /{" "}
                    {seatsPerTimeslot} {t("seats_available")}
                  </p>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
