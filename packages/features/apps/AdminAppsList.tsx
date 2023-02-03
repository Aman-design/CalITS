import { zodResolver } from "@hookform/resolvers/zod";
import { AppCategories } from "@prisma/client";
import { useRouter } from "next/router";
import { useState, useReducer, FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import AppCategoryNavigation from "@calcom/app-store/_components/AppCategoryNavigation";
import { appKeysSchemas } from "@calcom/app-store/apps.keys-schemas.generated";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { RouterOutputs, trpc } from "@calcom/trpc/react";
import {
  Button,
  ConfirmationDialogContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyScreen,
  Form,
  List,
  showToast,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
} from "@calcom/ui";
import {
  FiAlertCircle,
  FiEdit,
  FiMoreHorizontal,
  FiCheckCircle,
  FiXCircle,
} from "@calcom/ui/components/icon";

import AppListCard from "../../../apps/web/components/AppListCard";

type App = RouterOutputs["viewer"]["appsRouter"]["listLocal"][number];

const IntegrationContainer = ({
  app,
  category,
  handleModelOpen,
}: {
  app: App;
  category: string;
  handleModelOpen: (data: EditModalState) => void;
}) => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const [disableDialog, setDisableDialog] = useState(false);

  const showKeyModal = () => {
    if (app.keys) {
      handleModelOpen({
        dirName: app.dirName,
        keys: app.keys,
        slug: app.slug,
        type: app.type,
        isOpen: "editKeys",
      });
    }
  };

  const enableAppMutation = trpc.viewer.appsRouter.toggle.useMutation({
    onSuccess: (enabled) => {
      utils.viewer.appsRouter.listLocal.invalidate({ category });
      setDisableDialog(false);
      showToast(
        enabled ? t("app_is_enabled", { appName: app.name }) : t("app_is_disabled", { appName: app.name }),
        "success"
      );
      if (enabled) {
        showKeyModal();
      }
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  return (
    <li>
      <AppListCard
        logo={app.logo}
        description={app.description}
        title={app.name}
        isTemplate={app.isTemplate}
        actions={
          <div className="flex justify-self-end">
            <Dropdown modal={false}>
              <DropdownMenuTrigger asChild>
                <Button StartIcon={FiMoreHorizontal} variant="icon" color="secondary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {app.keys && (
                  <DropdownMenuItem>
                    <DropdownItem onClick={showKeyModal} type="button" StartIcon={FiEdit}>
                      {t("edit_keys")}
                    </DropdownItem>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    if (app.enabled) {
                      setDisableDialog(true);
                    } else {
                      enableAppMutation.mutate({ slug: app.slug, enabled: app.enabled });
                    }
                  }}>
                  <DropdownItem StartIcon={app.enabled ? FiXCircle : FiCheckCircle} type="button">
                    {app.enabled ? t("disable") : t("enable")}
                  </DropdownItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </Dropdown>
          </div>
        }
      />

      <Dialog open={disableDialog} onOpenChange={setDisableDialog}>
        <ConfirmationDialogContent
          title={t("disable_app")}
          variety="danger"
          onConfirm={() => {
            enableAppMutation.mutate({ slug: app.slug, enabled: app.enabled });
          }}>
          {t("disable_app_description")}
        </ConfirmationDialogContent>
      </Dialog>
    </li>
  );
};

const querySchema = z.object({
  category: z
    .nativeEnum({ ...AppCategories, conferencing: "conferencing" })
    .optional()
    .default(AppCategories.calendar),
});

const AdminAppsList = ({
  baseURL,
  className,
  useQueryParam = false,
}: {
  baseURL: string;
  className?: string;
  useQueryParam?: boolean;
}) => {
  const router = useRouter();
  return (
    <form
      id="wizard-step-2"
      name="wizard-step-2"
      onSubmit={(e) => {
        e.preventDefault();
        router.replace("/");
      }}>
      <AppCategoryNavigation
        baseURL={baseURL}
        fromAdmin
        useQueryParam={useQueryParam}
        containerClassname="min-w-0 w-full"
        className={className}>
        <AdminAppsListContainer />
      </AppCategoryNavigation>
    </form>
  );
};

const EditKeysModal: FC<{
  dirName: string;
  slug: string;
  type: string;
  isOpen: boolean;
  keys: App["keys"];
  handleModelClose: () => void;
}> = (props) => {
  const { t } = useLocale();
  const { dirName, slug, type, isOpen, keys, handleModelClose } = props;
  const appKeySchema = appKeysSchemas[dirName as keyof typeof appKeysSchemas];

  const formMethods = useForm({
    resolver: zodResolver(appKeySchema),
  });

  const saveKeysMutation = trpc.viewer.appsRouter.saveKeys.useMutation({
    onSuccess: () => {
      showToast(t("keys_have_been_saved"), "success");
      handleModelClose();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleModelClose}>
      <DialogContent title={t("edit_keys")} type="creation">
        {!!keys && typeof keys === "object" && (
          <Form
            id="edit-keys"
            form={formMethods}
            handleSubmit={(values) =>
              saveKeysMutation.mutate({
                slug,
                type,
                keys: values,
                dirName,
              })
            }
            className="px-4 pb-4">
            {Object.keys(keys).map((key) => (
              <Controller
                name={key}
                key={key}
                control={formMethods.control}
                defaultValue={keys && keys[key] ? keys?.[key] : ""}
                render={({ field: { value } }) => (
                  <TextField
                    label={key}
                    key={key}
                    name={key}
                    value={value}
                    onChange={(e) => {
                      formMethods.setValue(key, e?.target.value);
                    }}
                  />
                )}
              />
            ))}
          </Form>
        )}
        <DialogFooter>
          <DialogClose onClick={handleModelClose} />
          <Button form="edit-keys" type="submit">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditModalState extends Pick<App, "keys"> {
  isOpen: "none" | "editKeys" | "disableKeys";
  dirName: string;
  type: string;
  slug: string;
}

const AdminAppsListContainer = () => {
  const { t } = useLocale();
  const router = useRouter();
  const { category } = querySchema.parse(router.query);

  const { data: apps, isLoading } = trpc.viewer.appsRouter.listLocal.useQuery(
    { category },
    { enabled: router.isReady }
  );

  const [modalState, setModalState] = useReducer(
    (data: EditModalState, partialData: Partial<EditModalState>) => ({ ...data, ...partialData }),
    {
      keys: null,
      isOpen: "none",
      dirName: "",
      type: "",
      slug: "",
    }
  );

  const handleModelClose = () =>
    setModalState({ keys: null, isOpen: "none", dirName: "", slug: "", type: "" });

  const handleModelOpen = (data: EditModalState) => setModalState({ ...data });

  if (isLoading) return <SkeletonLoader />;

  if (!apps) {
    return (
      <EmptyScreen
        Icon={FiAlertCircle}
        headline={t("no_available_apps")}
        description={t("no_available_apps_description")}
      />
    );
  }

  return (
    <>
      <List>
        {apps.map((app) => (
          <IntegrationContainer
            handleModelOpen={handleModelOpen}
            app={app}
            key={app.name}
            category={category}
          />
        ))}
      </List>
      <EditKeysModal
        keys={modalState.keys}
        dirName={modalState.dirName}
        handleModelClose={handleModelClose}
        isOpen={modalState.isOpen === "editKeys"}
        slug={modalState.slug}
        type={modalState.type}
      />
    </>
  );
};

export default AdminAppsList;

const SkeletonLoader = () => {
  return (
    <SkeletonContainer className="w-[30rem] pr-10">
      <div className="mt-6 mb-8 space-y-6">
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};
