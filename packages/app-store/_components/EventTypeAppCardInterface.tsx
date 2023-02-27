import type { GetAppData, SetAppData } from "@calcom/app-store/EventTypeAppContext";
import EventTypeAppContext from "@calcom/app-store/EventTypeAppContext";
import { EventTypeAddonMap } from "@calcom/app-store/apps.browser.generated";
import type { RouterOutputs } from "@calcom/trpc/react";
import { ErrorBoundary } from "@calcom/ui";

import type { EventTypeAppCardComponentProps } from "../types";
import { DynamicComponent } from "./DynamicComponent";

export const EventTypeAppCard = (props: {
  app: RouterOutputs["viewer"]["apps"][number];
  eventType: EventTypeAppCardComponentProps["eventType"];
  getAppData: GetAppData;
  setAppData: SetAppData;
}) => {
  const { app, getAppData, setAppData } = props;
  return (
    <ErrorBoundary message={`There is some problem with ${app.name} App`}>
      <EventTypeAppContext.Provider value={[getAppData, setAppData]}>
        <DynamicComponent
          slug={app.slug === "stripe" ? "stripepayment" : app.slug}
          componentMap={EventTypeAddonMap}
          {...props}
        />
      </EventTypeAppContext.Provider>
    </ErrorBoundary>
  );
};
