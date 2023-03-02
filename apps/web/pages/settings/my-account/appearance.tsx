import { Controller, useForm } from "react-hook-form";

import ThemeLabel from "@calcom/features/settings/ThemeLabel";
import { getLayout } from "@calcom/features/settings/layouts/SettingsLayout";
import { APP_NAME } from "@calcom/lib/constants";
import { useHasPaidPlan } from "@calcom/lib/hooks/useHasPaidPlan";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  ColorPicker,
  Form,
  Meta,
  showToast,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  Switch,
  UpgradeTeamsBadge,
} from "@calcom/ui";

const SkeletonLoader = ({ title, description }: { title: string; description: string }) => {
  return (
    <SkeletonContainer>
      <Meta title={title} description={description} />
      <div className="mt-6 mb-8 space-y-6 divide-y">
        <div className="flex items-center">
          <SkeletonButton className="mr-6 h-32 w-48 rounded-md p-5" />
          <SkeletonButton className="mr-6 h-32 w-48 rounded-md p-5" />
          <SkeletonButton className="mr-6 h-32 w-48 rounded-md p-5" />
        </div>
        <div className="flex justify-between">
          <SkeletonText className="h-8 w-1/3" />
          <SkeletonText className="h-8 w-1/3" />
        </div>

        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

const AppearanceView = () => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const { data: user, isLoading } = trpc.viewer.me.useQuery();

  const { isLoading: isTeamPlanStatusLoading, hasPaidPlan } = useHasPaidPlan();

  const formMethods = useForm({
    defaultValues: {
      theme: user?.theme,
      brandColor: user?.brandColor || "#292929",
      darkBrandColor: user?.darkBrandColor || "#fafafa",
      hideBranding: user?.hideBranding,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.viewer.me.invalidate();
      showToast(t("settings_updated_successfully"), "success");
    },
    onError: () => {
      showToast(t("error_updating_settings"), "error");
    },
  });

  if (isLoading || isTeamPlanStatusLoading)
    return <SkeletonLoader title={t("appearance")} description={t("appearance_description")} />;

  if (!user) return null;

  const isDisabled = isSubmitting || !isDirty;

  return (
    <Form
      form={formMethods}
      handleSubmit={(values) => {
        mutation.mutate({
          ...values,
          // Radio values don't support null as values, therefore we convert an empty string
          // back to null here.
          theme: values.theme || null,
        });
      }}>
      <Meta title={t("appearance")} description={t("appearance_description")} />
      <div className="mb-6 flex items-center text-sm">
        <div>
          <p className="font-semibold">{t("theme")}</p>
          <p className="text-gray-600">{t("theme_applies_note")}</p>
        </div>
      </div>
      <div className="flex flex-col justify-between sm:flex-row">
        <ThemeLabel
          variant="system"
          value={null}
          label={t("theme_system")}
          defaultChecked={user.theme === null}
          register={formMethods.register}
        />
        <ThemeLabel
          variant="light"
          value="light"
          label={t("theme_light")}
          defaultChecked={user.theme === "light"}
          register={formMethods.register}
        />
        <ThemeLabel
          variant="dark"
          value="dark"
          label={t("theme_dark")}
          defaultChecked={user.theme === "dark"}
          register={formMethods.register}
        />
      </div>

      <hr className="my-8 border border-gray-200" />
      <div className="mb-6 flex items-center text-sm">
        <div>
          <p className="font-semibold">{t("custom_brand_colors")}</p>
          <p className="mt-0.5 leading-5 text-gray-600">{t("customize_your_brand_colors")}</p>
        </div>
      </div>

      <div className="block justify-between sm:flex">
        <Controller
          name="brandColor"
          control={formMethods.control}
          defaultValue={user.brandColor}
          render={() => (
            <div>
              <p className="mb-2 block text-sm font-medium text-gray-900">{t("light_brand_color")}</p>
              <ColorPicker
                defaultValue={user.brandColor}
                onChange={(value) => formMethods.setValue("brandColor", value, { shouldDirty: true })}
              />
            </div>
          )}
        />
        <Controller
          name="darkBrandColor"
          control={formMethods.control}
          defaultValue={user.darkBrandColor}
          render={() => (
            <div className="mt-6 sm:mt-0">
              <p className="mb-2 block text-sm font-medium text-gray-900">{t("dark_brand_color")}</p>
              <ColorPicker
                defaultValue={user.darkBrandColor}
                onChange={(value) => formMethods.setValue("darkBrandColor", value, { shouldDirty: true })}
              />
            </div>
          )}
        />
      </div>
      {/* TODO future PR to preview brandColors */}
      {/* <Button
        color="secondary"
        EndIcon={FiExternalLink}
        className="mt-6"
        onClick={() => window.open(`${WEBAPP_URL}/${user.username}/${user.eventTypes[0].title}`, "_blank")}>
        Preview
      </Button> */}
      <hr className="my-8 border border-gray-200" />
      <Controller
        name="hideBranding"
        control={formMethods.control}
        defaultValue={user.hideBranding}
        render={({ field: { value } }) => (
          <>
            <div className="flex w-full text-sm">
              <div className="mr-1 flex-grow">
                <div className="flex items-center">
                  <p className="font-semibold ltr:mr-2 rtl:ml-2">
                    {t("disable_cal_branding", { appName: APP_NAME })}
                  </p>
                  <UpgradeTeamsBadge />
                </div>
                <p className="mt-0.5  text-gray-600">{t("removes_cal_branding", { appName: APP_NAME })}</p>
              </div>
              <div className="flex-none">
                <Switch
                  id="hideBranding"
                  disabled={!hasPaidPlan}
                  onCheckedChange={(checked) =>
                    formMethods.setValue("hideBranding", checked, { shouldDirty: true })
                  }
                  checked={hasPaidPlan ? value : false}
                />
              </div>
            </div>
          </>
        )}
      />
      <Button
        disabled={isDisabled}
        type="submit"
        loading={mutation.isLoading}
        color="primary"
        className="mt-8">
        {t("update")}
      </Button>
    </Form>
  );
};

AppearanceView.getLayout = getLayout;

export default AppearanceView;
