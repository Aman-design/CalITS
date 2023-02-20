import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import type { UIEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { classNames } from "@calcom/lib";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { AppFrontendPayload as App } from "@calcom/types/App";
import type { CredentialFrontendPayload as Credential } from "@calcom/types/Credential";

import { EmptyScreen } from "../empty-screen";
import { FiChevronLeft, FiChevronRight, FiSearch } from "../icon";
import { AppCard } from "./AppCard";

export function useShouldShowArrows() {
  const ref = useRef<HTMLUListElement>(null);
  const [showArrowScroll, setShowArrowScroll] = useState({
    left: false,
    right: false,
  });

  useEffect(() => {
    const appCategoryList = ref.current;
    if (appCategoryList && appCategoryList.scrollWidth > appCategoryList.clientWidth) {
      setShowArrowScroll({ left: false, right: true });
    }
  }, []);

  const calculateScroll = (e: UIEvent<HTMLUListElement>) => {
    setShowArrowScroll({
      left: e.currentTarget.scrollLeft > 0,
      right:
        Math.floor(e.currentTarget.scrollWidth) - Math.floor(e.currentTarget.offsetWidth) !==
        Math.floor(e.currentTarget.scrollLeft),
    });
  };

  return { ref, calculateScroll, leftVisible: showArrowScroll.left, rightVisible: showArrowScroll.right };
}

type AllAppsPropsType = {
  apps: (App & { credentials?: Credential[] })[];
  searchText?: string;
  categories: string[];
};

interface CategoryTabProps {
  selectedCategory: string | null;
  categories: string[];
  searchText?: string;
}

function CategoryTab({ selectedCategory, categories, searchText }: CategoryTabProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { ref, calculateScroll, leftVisible, rightVisible } = useShouldShowArrows();
  const handleLeft = () => {
    if (ref.current) {
      ref.current.scrollLeft -= 100;
    }
  };

  const handleRight = () => {
    if (ref.current) {
      ref.current.scrollLeft += 100;
    }
  };
  return (
    <div className="relative mb-4 flex flex-col justify-between lg:flex-row lg:items-center">
      <h2 className="hidden text-base font-semibold leading-none text-gray-900 sm:block">
        {searchText
          ? t("search")
          : t("explore_apps", {
              category:
                (selectedCategory && selectedCategory[0].toUpperCase() + selectedCategory.slice(1)) ||
                t("all_apps"),
            })}
      </h2>
      {leftVisible && (
        <button onClick={handleLeft} className="absolute bottom-0 flex md:left-1/2 md:-top-1">
          <div className="flex h-10 w-5 items-center justify-end bg-white">
            <FiChevronLeft className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex h-10 w-5 bg-gradient-to-l from-transparent to-white" />
        </button>
      )}
      <ul
        className="no-scrollbar mt-3 flex max-w-full space-x-1 overflow-x-auto lg:mt-0 lg:max-w-[50%]"
        onScroll={(e) => calculateScroll(e)}
        ref={ref}>
        <li
          onClick={() => {
            router.replace(router.asPath.split("?")[0], undefined, { shallow: true });
          }}
          className={classNames(
            selectedCategory === null ? "bg-gray-900 text-gray-50" : "bg-gray-50 text-gray-900",
            "rounded-md px-4 py-2.5 text-sm font-medium hover:cursor-pointer hover:bg-gray-900 hover:text-gray-50"
          )}>
          {t("all_apps")}
        </li>
        {categories.map((cat, pos) => (
          <li
            key={pos}
            onClick={() => {
              if (selectedCategory === cat) {
                router.replace(router.asPath.split("?")[0], undefined, { shallow: true });
              } else {
                router.replace(router.asPath.split("?")[0] + `?category=${cat}`, undefined, {
                  shallow: true,
                });
              }
            }}
            className={classNames(
              selectedCategory === cat ? "bg-gray-900 text-gray-50" : "bg-gray-50 text-gray-900",
              "rounded-md px-4 py-2.5 text-sm font-medium hover:cursor-pointer hover:bg-gray-900 hover:text-gray-50"
            )}>
            {cat[0].toUpperCase() + cat.slice(1)}
          </li>
        ))}
      </ul>
      {rightVisible && (
        <button onClick={handleRight} className="absolute bottom-0 right-0 flex md:-top-1">
          <div className="flex h-10 w-5 bg-gradient-to-r from-transparent to-white" />
          <div className="flex h-10 w-5 items-center justify-end bg-white">
            <FiChevronRight className="h-4 w-4 text-gray-500" />
          </div>
        </button>
      )}
    </div>
  );
}

export function AllApps({ apps, searchText, categories }: AllAppsPropsType) {
  const router = useRouter();
  const { t } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appsContainerRef, enableAnimation] = useAutoAnimate<HTMLDivElement>();

  if (searchText) {
    enableAnimation && enableAnimation(false);
  }

  useEffect(() => {
    const queryCategory =
      typeof router.query.category === "string" && categories.includes(router.query.category)
        ? router.query.category
        : null;
    setSelectedCategory(queryCategory);
  }, [router.query.category]);

  const filteredApps = apps
    .filter((app) =>
      selectedCategory !== null
        ? app.categories
          ? app.categories.includes(selectedCategory)
          : app.category === selectedCategory
        : true
    )
    .filter((app) => (searchText ? app.name.toLowerCase().includes(searchText.toLowerCase()) : true))
    .sort(function (a, b) {
      if (a.name < b.name) return -1;
      else if (a.name > b.name) return 1;
      return 0;
    });

  return (
    <div>
      <CategoryTab selectedCategory={selectedCategory} searchText={searchText} categories={categories} />
      {filteredApps.length ? (
        <div
          className="grid gap-3 lg:grid-cols-4 [@media(max-width:1270px)]:grid-cols-3 [@media(max-width:730px)]:grid-cols-2 [@media(max-width:500px)]:grid-cols-1"
          ref={appsContainerRef}>
          {filteredApps.map((app) => (
            <AppCard key={app.name} app={app} searchText={searchText} credentials={app.credentials} />
          ))}{" "}
        </div>
      ) : (
        <EmptyScreen
          Icon={FiSearch}
          headline={t("no_results")}
          description={searchText ? searchText?.toString() : ""}
        />
      )}
    </div>
  );
}
