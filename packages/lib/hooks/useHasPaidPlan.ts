import { trpc } from "@calcom/trpc/react";

import { IS_SELF_HOSTED } from "../constants";
import hasKeyInMetadata from "../hasKeyInMetadata";

export function useHasPaidPlan() {
  if (IS_SELF_HOSTED) return { isLoading: false, hasPaidPlan: true };

  const { data: hasTeamPlan, isLoading: isLoadingTeamQuery } = trpc.viewer.teams.hasTeamPlan.useQuery();

  const { data: user, isLoading: isLoadingUserQuery } = trpc.viewer.me.useQuery();

  const isLoading = isLoadingTeamQuery || isLoadingUserQuery;

  const isCurrentUsernamePremium = user && user.metadata && hasKeyInMetadata(user, "isPremium");

  const hasPaidPlan = hasTeamPlan?.hasTeamPlan || isCurrentUsernamePremium;

  return { isLoading, hasPaidPlan };
}

export function useTeamInvites() {
  const listInvites = trpc.viewer.teams.listInvites.useQuery();

  return { isLoading: listInvites.isLoading, listInvites: listInvites.data };
}

export function useHasTeamPlan() {
  const { data: hasTeamPlan, isLoading } = trpc.viewer.teams.hasTeamPlan.useQuery();

  return { isLoading, hasTeamPlan: hasTeamPlan?.hasTeamPlan };
}

export default useHasPaidPlan;
