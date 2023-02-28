import { Fragment } from "react";
import React from "react";

import { getEventLocationType } from "@calcom/app-store/locations";
import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import {
  FiInfo,
  FiClock,
  FiMapPin,
  FiCheckSquare,
  FiRefreshCcw,
  FiCreditCard,
} from "@calcom/ui/components/icon";

import type { PublicEvent } from "../../types";
import { EventDetailBlocks } from "../../types";
import { EventDuration } from "./Duration";
import { EventOccurences } from "./Occurences";
import { EventPrice } from "./Price";

type EventDetailsPropsBase = {
  event: PublicEvent;
  className?: string;
};

type EventDetailDefaultBlock = {
  blocks?: EventDetailBlocks[];
};

// Rendering a custom block requires passing a name prop,
// which is used as a key for the block.
type EventDetailCustomBlock = {
  blocks?: React.FC[];
  name: string;
};

type EventDetailsProps = EventDetailsPropsBase & (EventDetailDefaultBlock | EventDetailCustomBlock);

interface EventMetaProps {
  icon: React.FC<{ className: string }> | string;
  children: React.ReactNode;
  // Emphasises the text in the block. For now only
  // applying in dark mode.
  highlight?: boolean;
  contentClassName?: string;
  className?: string;
}

/**
 * Default order in which the event details will be rendered.
 */
const defaultEventDetailsBlocks = [
  EventDetailBlocks.DESCRIPTION,
  EventDetailBlocks.REQUIRES_CONFIRMATION,
  EventDetailBlocks.DURATION,
  EventDetailBlocks.OCCURENCES,
  EventDetailBlocks.LOCATION,
  EventDetailBlocks.PRICE,
];

/**
 * Helper component that ensures the meta data of an event is
 * rendered in a consistent way — adds an icon and children (text usually).
 */
export const EventMetaBlock = ({
  icon: Icon,
  children,
  highlight,
  contentClassName,
  className,
}: EventMetaProps) => {
  if (!React.Children.count(children)) return null;

  return (
    <div
      className={classNames(
        "flex items-start justify-start text-gray-600",
        highlight ? "dark:text-white" : "dark:text-darkgray-600",
        className
      )}>
      {typeof Icon === "string" ? (
        <img
          src={Icon}
          alt=""
          className="mr-2 mt-1 h-4 w-4 flex-shrink-0 dark:[filter:invert(1)_brightness(0.6)]"
        />
      ) : (
        <Icon className="relative z-20 mr-2 mt-1 h-4 w-4 flex-shrink-0" />
      )}
      <div className={classNames("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
};

/**
 * Component that renders event meta data in a structured way, with icons and labels.
 * The component can be configured to show only specific blocks by overriding the
 * `blocks` prop. The blocks prop takes in an array of block names, defined
 * in the `EventDetailBlocks` enum. See the `defaultEventDetailsBlocks` const
 * for the default order in which the blocks will be rendered.
 *
 * As part of the blocks array you can also decide to render a custom React Component,
 * which will then also be rendered.
 *
 * Example:
 * const MyCustomBlock = () => <div>Something nice</div>;
 * <EventDetails event={event} blocks={[EventDetailBlocks.LOCATION, MyCustomBlock]} />
 */
export const EventDetails = ({ event, blocks = defaultEventDetailsBlocks }: EventDetailsProps) => {
  const { t } = useLocale();
  return (
    <>
      {blocks.map((block) => {
        if (typeof block === "function") {
          return <Fragment key={block.name}>block(event)</Fragment>;
        }

        switch (block) {
          case EventDetailBlocks.DESCRIPTION:
            if (!event.description) return null;
            return (
              <EventMetaBlock
                key={block}
                icon={FiInfo}
                contentClassName="break-words max-w-full overflow-clip">
                {/*  @ts-expect-error: @see packages/prisma/middleware/eventTypeDescriptionParseAndSanitize.ts */}
                <div dangerouslySetInnerHTML={{ __html: event.descriptionAsSafeHTML }} />
              </EventMetaBlock>
            );

          case EventDetailBlocks.DURATION:
            return (
              <EventMetaBlock key={block} icon={FiClock}>
                <EventDuration event={event} />
              </EventMetaBlock>
            );

          case EventDetailBlocks.LOCATION:
            if (!event?.locations?.length) return null;
            return (
              <React.Fragment key={block}>
                {event.locations.map((location) => {
                  const eventLocationType = getEventLocationType(location.type);
                  return (
                    <EventMetaBlock key={location.type} icon={eventLocationType?.iconUrl || FiMapPin}>
                      <div key={location.type} className="flex flex-row items-center text-sm font-medium">
                        {t(eventLocationType?.label ?? "")}
                      </div>
                    </EventMetaBlock>
                  );
                })}
              </React.Fragment>
            );

          case EventDetailBlocks.REQUIRES_CONFIRMATION:
            if (!event.requiresConfirmation) return null;

            return (
              <EventMetaBlock key={block} icon={FiCheckSquare}>
                {t("requires_confirmation")}
              </EventMetaBlock>
            );

          case EventDetailBlocks.OCCURENCES:
            if (!event.requiresConfirmation) return null;

            return (
              <EventMetaBlock key={block} icon={FiRefreshCcw}>
                <EventOccurences event={event} />
              </EventMetaBlock>
            );

          case EventDetailBlocks.PRICE:
            if (event.price === 0) return null;

            return (
              <EventMetaBlock key={block} icon={FiCreditCard}>
                <EventPrice event={event} />
              </EventMetaBlock>
            );
        }
      })}
    </>
  );
};
