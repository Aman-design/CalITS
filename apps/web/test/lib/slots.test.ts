import { expect, it } from "@jest/globals";
import MockDate from "mockdate";

import dayjs from "@calcom/dayjs";
import { MINUTES_DAY_END, MINUTES_DAY_START } from "@calcom/lib/availability";
import getSlots from "@calcom/lib/slots";

MockDate.set("2021-06-20T11:59:59Z");

describe("Tests the slot logic", () => {
  it("can fit 24 hourly slots for an empty day", async () => {
    // 24h in a day.
    expect(
      getSlots({
        inviteeDate: dayjs.utc().add(1, "day"),
        frequency: 60,
        minimumBookingNotice: 0,
        workingHours: [
          {
            userId: 1,
            days: Array.from(Array(7).keys()),
            startTime: MINUTES_DAY_START,
            endTime: MINUTES_DAY_END,
          },
        ],
        eventLength: 60,
        organizerTimeZone: "America/Toronto",
      })
    ).toHaveLength(24);
  });

  // TODO: This test is sound; it should pass!
  it("only shows future booking slots on the same day", async () => {
    // The mock date is 1s to midday, so 12 slots should be open given 0 booking notice.
    expect(
      getSlots({
        inviteeDate: dayjs.utc(),
        frequency: 60,
        minimumBookingNotice: 0,
        workingHours: [
          {
            userId: 1,
            days: Array.from(Array(7).keys()),
            startTime: MINUTES_DAY_START,
            endTime: MINUTES_DAY_END,
          },
        ],
        eventLength: 60,
        organizerTimeZone: "America/Toronto",
      })
    ).toHaveLength(12);
  });

  it("can cut off dates that due to invitee timezone differences fall on the next day", async () => {
    expect(
      getSlots({
        inviteeDate: dayjs().tz("Europe/Amsterdam").startOf("day"), // time translation +01:00
        frequency: 60,
        minimumBookingNotice: 0,
        workingHours: [
          {
            userId: 1,
            days: [0],
            startTime: 23 * 60, // 23h
            endTime: MINUTES_DAY_END,
          },
        ],
        eventLength: 60,
        organizerTimeZone: "America/Toronto",
      })
    ).toHaveLength(0);
  });

  it("can cut off dates that due to invitee timezone differences fall on the previous day", async () => {
    const workingHours = [
      {
        userId: 1,
        days: [0],
        startTime: MINUTES_DAY_START,
        endTime: 1 * 60, // 1h
      },
    ];
    expect(
      getSlots({
        inviteeDate: dayjs().tz("Atlantic/Cape_Verde").startOf("day"), // time translation -01:00
        frequency: 60,
        minimumBookingNotice: 0,
        workingHours,
        eventLength: 60,
        organizerTimeZone: "America/Toronto",
      })
    ).toHaveLength(0);
  });

  it("adds minimum booking notice correctly", async () => {
    // 24h in a day.
    expect(
      getSlots({
        inviteeDate: dayjs.utc().add(1, "day").startOf("day"),
        frequency: 60,
        minimumBookingNotice: 1500,
        workingHours: [
          {
            userId: 1,
            days: Array.from(Array(7).keys()),
            startTime: MINUTES_DAY_START,
            endTime: MINUTES_DAY_END,
          },
        ],
        eventLength: 60,
        organizerTimeZone: "America/Toronto",
      })
    ).toHaveLength(11);
  });
});
