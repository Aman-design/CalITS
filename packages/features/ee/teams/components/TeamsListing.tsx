import { useState, useMemo } from "react";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Alert, Button, ButtonGroup, Label } from "@calcom/ui";
import { FiUsers, FiRefreshCcw, FiUserPlus, FiMail, FiVideo, FiEyeOff } from "@calcom/ui/components/icon";

import { UpgradeTip } from "../../../tips";
import SkeletonLoaderTeamList from "./SkeletonloaderTeamList";
import TeamList from "./TeamList";

export function TeamsListing() {
  const { t } = useLocale();
  const [errorMessage, setErrorMessage] = useState("");

  const { data, isLoading } = trpc.viewer.teams.list.useQuery(undefined, {
    onError: (e) => {
      setErrorMessage(e.message);
    },
  });

  const teams = useMemo(() => data?.filter((m) => m.accepted) || [], [data]);
  const invites = useMemo(() => data?.filter((m) => !m.accepted) || [], [data]);

  const features = [
    {
      icon: <FiUsers className="h-5 w-5 text-red-500" />,
      title: t("collective_scheduling"),
      description: t("make_it_easy_to_book"),
    },
    {
      icon: <FiRefreshCcw className="h-5 w-5 text-blue-500" />,
      title: t("round_robin"),
      description: t("find_the_best_person"),
    },
    {
      icon: <FiUserPlus className="h-5 w-5 text-green-500" />,
      title: t("fixed_round_robin"),
      description: t("add_one_fixed_attendee"),
    },
    {
      icon: <FiMail className="h-5 w-5 text-orange-500" />,
      title: t("sms_attendee_action"),
      description: t("make_it_easy_to_book"),
    },
    {
      icon: <FiVideo className="h-5 w-5 text-purple-500" />,
      title: "Cal Video" + " " + t("recordings_title"),
      description: t("upgrade_to_access_recordings_description"),
    },
    {
      icon: <FiEyeOff className="h-5 w-5 text-indigo-500" />,
      title: t("disable_cal_branding", { appName: APP_NAME }),
      description: t("disable_cal_branding_description", { appName: APP_NAME }),
    },
  ];

  if (isLoading) {
    return <SkeletonLoaderTeamList />;
  }

  return (
    <>
      {!!errorMessage && <Alert severity="error" title={errorMessage} />}

      <UpgradeTip
        title="calcom_is_better_with_team"
        description="add_your_team_members"
        emptyTitle="no_teams"
        emptyDescription="no_teams_description"
        features={features}
        background="/team-banner-background.jpg"
        buttons={
          <div className="space-y-2 rtl:space-x-reverse sm:space-x-2">
            <ButtonGroup>
              <Button color="primary" href={`${WEBAPP_URL}/settings/teams/new`}>
                {t("create_team")}
              </Button>
              <Button color="secondary" href="https://go.cal.com/teams-video" target="_blank">
                {t("learn_more")}
              </Button>
            </ButtonGroup>
          </div>
        }>
        <>
          {invites.length > 0 && (
            <div className="mb-6 rounded-md bg-gray-100 p-5">
              <Label className="dark:text-darkgray-900 pb-2 font-semibold text-gray-900">
                {t("pending_invites")}
              </Label>
              <TeamList teams={invites} />
            </div>
          )}
          {teams.length > 0 && <TeamList teams={teams} />}
        </>
      </UpgradeTip>
    </>
  );
}
