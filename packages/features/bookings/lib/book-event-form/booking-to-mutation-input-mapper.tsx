import { v4 as uuidv4 } from "uuid";

import { getEventLocationValue } from "@calcom/app-store/locations";
import dayjs from "@calcom/dayjs";
import { parseRecurringDates } from "@calcom/lib/parse-dates";

import { BookingFormValues } from "../../BookEventForm/form-config";
import { BookingCreateBody, RecurringBookingCreateBody } from "../../types";
import { PublicEvent } from "../../types";

type BookingOptions = {
  values: BookingFormValues;
  event: PublicEvent;
  date: string;
  // @NOTE: duration is not validated in this function
  duration: number | undefined | null;
  timeZone: string;
  language: string;
};

export const mapBookingToMutationInput = ({
  values,
  event,
  date,
  duration,
  timeZone,
  language,
}: BookingOptions): BookingCreateBody => {
  const customInputs = Object.keys(values.customInputs || {}).map((inputId) => ({
    label: event.customInputs.find((input) => input.id === parseInt(inputId))?.label || "",
    value: values.customInputs && values.customInputs[inputId] ? values.customInputs[inputId] : "",
  }));

  return {
    ...values,
    start: dayjs(date).format(),
    end: dayjs(date)
      // Defaults to the default event length in case no custom duration is set.
      .add(duration || event.length, "minute")
      .format(),
    eventTypeId: event.id,
    eventTypeSlug: event.slug,
    timeZone: timeZone,
    language: language,
    guests: values.guests ? values.guests.map(({ email }) => email) : [],
    //@TODO:
    // rescheduleid
    location: getEventLocationValue(event.locations, {
      type: (values.locationType ? values.locationType : event.locations[0]?.type) || "",
      phone: values.phone,
      attendeeAddress: values.attendeeAddress,
    }),
    customInputs,
    // @TODO:
    //metadata,
    metadata: {},
    hasHashedBookingLink: false,
    // hasHashedBookingLink,
    //     hashedLink,
    //     smsReminderNumber:
    //       selectedLocationType === LocationType.Phone
    //         ? booking.phone
    //         : booking.smsReminderNumber || undefined,
    //     ethSignature: gateState.rainbowToken,
    //     guests: booking.guests?.map((guest) => guest.email),
  };
};

// This method is here to ensure that the types are correct (recurring count is required),
// as well as generate a unique ID for the recurring bookings and turn one single booking
// into an array of mutiple bookings based on the recurring count.
// Other than that it forwards the mapping to mapBookingToMutationInput.
export const mapRecurringBookingToMutationInput = (
  booking: BookingOptions,
  recurringCount: number
): RecurringBookingCreateBody[] => {
  const recurringEventId = uuidv4();
  const [, recurringDates] = parseRecurringDates(
    {
      startDate: booking.date,
      timeZone: booking.timeZone,
      recurringEvent: booking.event.recurringEvent,
      recurringCount,
    },
    booking.language
  );

  const input = mapBookingToMutationInput(booking);

  return recurringDates.map((recurringDate) => ({
    ...input,
    start: dayjs(recurringDate).format(),
    end: dayjs(recurringDate)
      .add(booking.duration || booking.event.length, "minute")
      .format(),
    recurringEventId,
    recurringCount: recurringDates.length,
  }));
};
