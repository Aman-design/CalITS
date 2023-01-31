import { Tooltip } from "@calcom/ui";
import { FiInfo } from "@calcom/ui/components/icon";

export default function InfoBadge({ content }: { content: string }) {
  return (
    <>
      <Tooltip side="top" content={content}>
        <span title={content}>
          <FiInfo className="relative top-px left-1 right-1 mt-px h-4 w-4 text-gray-500" />
        </span>
      </Tooltip>
    </>
  );
}
