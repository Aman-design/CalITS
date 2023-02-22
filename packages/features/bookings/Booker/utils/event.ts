import { shallow } from "zustand/shallow";

import { useSchedule } from "@calcom/features/schedules";
import { trpc } from "@calcom/trpc/react";

import { useTimePreferences } from "../../lib/timePreferences";
import { useBookerStore } from "../store";

/**
 * Wrapper hook around the trpc query that fetches
 * the event curently viewed in the booker. It will get
 * the current event slug and username from the booker store.
 *
 * Using this hook means you only need to use one hook, instead
 * of combining multiple conditional hooks.
 */
export const useEvent = () => {
  const [username, eventSlug, initialized] = useBookerStore(
    (state) => [state.username, state.eventSlug, state.initialized],
    shallow
  );

  return trpc.viewer.public.event.useQuery(
    { username: username ?? "", eventSlug: eventSlug ?? "" },
    { refetchOnWindowFocus: false, enabled: initialized }
  );
};

/**
 * Gets schedule for the current event and current month.
 * Gets all values from the booker store.
 *
 * Using this hook means you only need to use one hook, instead
 * of combining multiple conditional hooks.
 */
export const useScheduleForEvent = () => {
  const { timezone } = useTimePreferences();
  const event = useEvent();
  const [username, eventSlug, month] = useBookerStore(
    (state) => [state.username, state.eventSlug, state.month],
    shallow
  );

  return useSchedule({
    username,
    eventSlug,
    eventId: event.data?.id,
    month,
    timezone,
  });
};
