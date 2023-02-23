import DailyIframe from "@daily-co/daily-js";
import MarkdownIt from "markdown-it";
import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useState, useEffect } from "react";

import dayjs from "@calcom/dayjs";
import classNames from "@calcom/lib/classNames";
import { APP_NAME, SEO_IMG_OGIMG_VIDEO, WEBSITE_URL } from "@calcom/lib/constants";
import { formatToLocalizedDate, formatToLocalizedTime } from "@calcom/lib/date-fns";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import prisma, { bookingMinimalSelect } from "@calcom/prisma";
import type { inferSSRProps } from "@calcom/types/inferSSRProps";
import { FiChevronRight } from "@calcom/ui/components/icon";

import { ssrInit } from "@server/lib/ssr";

export type JoinCallPageProps = inferSSRProps<typeof getServerSideProps>;
const md = new MarkdownIt("default", { html: true, breaks: true, linkify: true });

export default function JoinCall(props: JoinCallPageProps) {
  const { t } = useLocale();
  const { meetingUrl, meetingPassword, booking } = props;

  useEffect(() => {
    const callFrame = DailyIframe.createFrame({
      theme: {
        colors: {
          accent: "#FFF",
          accentText: "#111111",
          background: "#111111",
          backgroundAccent: "#111111",
          baseText: "#FFF",
          border: "#292929",
          mainAreaBg: "#111111",
          mainAreaBgAccent: "#111111",
          mainAreaText: "#FFF",
          supportiveText: "#FFF",
        },
      },
      showLeaveButton: true,
      iframeStyle: {
        position: "fixed",
        width: "100%",
        height: "100%",
      },
      url: meetingUrl,
      ...(typeof meetingPassword === "string" && { token: meetingPassword }),
    });
    callFrame.join();
    return () => {
      callFrame.destroy();
    };
  }, []);

  const title = `${APP_NAME} Video`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("quick_video_meeting")} />
        <meta property="og:image" content={SEO_IMG_OGIMG_VIDEO} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${WEBSITE_URL}/video`} />
        <meta property="og:title" content={APP_NAME + " Video"} />
        <meta property="og:description" content={t("quick_video_meeting")} />
        <meta property="twitter:image" content={SEO_IMG_OGIMG_VIDEO} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${WEBSITE_URL}/video`} />
        <meta property="twitter:title" content={APP_NAME + " Video"} />
        <meta property="twitter:description" content={t("quick_video_meeting")} />
      </Head>
      <div style={{ zIndex: 2, position: "relative" }}>
        <img
          className="h-5·w-auto fixed z-10 hidden sm:inline-block"
          src={`${WEBSITE_URL}/cal-logo-word-dark.svg`}
          alt="Cal.com Logo"
          style={{
            top: 46,
            left: 24,
          }}
        />
      </div>
      <VideoMeetingInfo booking={booking} />
    </>
  );
}

interface ProgressBarProps {
  startTime: string;
  endTime: string;
}

function ProgressBar(props: ProgressBarProps) {
  const { startTime, endTime } = props;
  const currentTime = dayjs().second(0).millisecond(0);
  const startingTime = dayjs(startTime).second(0).millisecond(0);
  const isPast = currentTime.isAfter(startingTime);
  const currentDifference = dayjs().diff(startingTime, "minutes");
  const startDuration = dayjs(endTime).diff(startingTime, "minutes");
  const [duration] = useState(() => {
    if (currentDifference >= 0 && isPast) {
      return startDuration - currentDifference;
    } else {
      return startDuration;
    }
  });

  const prev = startDuration - duration;
  const percentage = prev * (100 / startDuration);
  return (
    <div>
      <p>{duration} minutes</p>
      <div className="relative h-2 max-w-xl overflow-hidden rounded-full">
        <div className="absolute h-full w-full bg-gray-500/10" />
        <div className={classNames("relative h-full bg-green-500")} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

interface VideoMeetingInfo {
  booking: JoinCallPageProps["booking"];
}

export function VideoMeetingInfo(props: VideoMeetingInfo) {
  const [open, setOpen] = useState(false);
  const { booking } = props;

  const endTime = new Date(booking.endTime);
  const startTime = new Date(booking.startTime);

  return (
    <>
      <aside
        className={classNames(
          "fixed top-0 z-30 flex h-full w-64 transform justify-between border-r border-gray-300/20 bg-black/80 backdrop-blur-lg transition-all duration-300 ease-in-out",
          open ? "left-0" : "-left-64"
        )}>
        <main className="prose prose-sm max-w-64 prose-a:text-white prose-h3:text-white prose-h3:font-cal overflow-scroll p-4 text-white shadow-sm">
          <h3>What:</h3>
          <p>{booking.title}</p>
          <h3>Invitee Time Zone:</h3>
          <p>{booking.user?.timeZone}</p>
          <h3>When:</h3>
          <p>
            {formatToLocalizedDate(startTime)} <br />
            {formatToLocalizedTime(startTime)}
          </p>
          <h3>Time left</h3>
          <ProgressBar
            key={String(open)}
            endTime={endTime.toISOString()}
            startTime={startTime.toISOString()}
          />

          <h3>Who:</h3>
          <p>
            {booking?.user?.name} - Organizer{" "}
            <a href={`mailto:${booking?.user?.email}`}>{booking?.user?.email}</a>
          </p>

          {booking.attendees.length
            ? booking.attendees.map((attendee) => (
                <p key={attendee.id}>
                  {attendee.name} – <a href={`mailto:${attendee.email}`}>{attendee.email}</a>
                </p>
              ))
            : null}

          <h3>Description</h3>

          <div
            className="prose prose-sm prose-invert"
            dangerouslySetInnerHTML={{ __html: md.render(booking.description ?? "") }}
          />
        </main>
        <div className="-mr-6 flex items-center justify-center">
          <button
            aria-label={`${open ? "close" : "open"} booking description sidebar`}
            className="h-20 w-6 rounded-r-md border border-l-0 border-gray-300/20 bg-black/60 text-white shadow-sm backdrop-blur-lg"
            onClick={() => setOpen(!open)}>
            <FiChevronRight
              aria-hidden
              className={classNames(open && "rotate-180", "w-5 transition-all duration-300 ease-in-out")}
            />
          </button>
        </div>
      </aside>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssr = await ssrInit(context);

  const booking = await prisma.booking.findUnique({
    where: {
      uid: context.query.uid as string,
    },
    select: {
      ...bookingMinimalSelect,
      uid: true,
      description: true,
      user: {
        select: {
          id: true,
          credentials: true,
          timeZone: true,
          name: true,
          email: true,
        },
      },
      references: {
        select: {
          uid: true,
          type: true,
          meetingUrl: true,
          meetingPassword: true,
        },
        where: {
          type: "daily_video",
        },
      },
    },
  });

  if (!booking || booking.references.length === 0 || !booking.references[0].meetingUrl) {
    return {
      redirect: {
        destination: "/video/no-meeting-found",
        permanent: false,
      },
    };
  }

  //daily.co calls have a 60 minute exit buffer when a user enters a call when it's not available it will trigger the modals
  const now = new Date();
  const exitDate = new Date(now.getTime() - 60 * 60 * 1000);

  //find out if the meeting is in the past
  const isPast = booking?.endTime <= exitDate;
  if (isPast) {
    return {
      redirect: {
        destination: `/video/meeting-ended/${booking?.uid}`,
        permanent: false,
      },
    };
  }

  const bookingObj = Object.assign({}, booking, {
    startTime: booking.startTime.toString(),
    endTime: booking.endTime.toString(),
  });
  const session = await getSession();

  // set meetingPassword to null for guests
  if (session?.user.id !== bookingObj.user?.id) {
    bookingObj.references.forEach((bookRef) => {
      bookRef.meetingPassword = null;
    });
  }

  return {
    props: {
      meetingUrl: bookingObj.references[0].meetingUrl ?? "",
      ...(typeof bookingObj.references[0].meetingPassword === "string" && {
        meetingPassword: bookingObj.references[0].meetingPassword,
      }),
      booking: bookingObj,
      trpcState: ssr.dehydrate(),
    },
  };
}
