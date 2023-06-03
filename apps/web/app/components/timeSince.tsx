import dayjs from "dayjs";
import DayJsRelativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(DayJsRelativeTime);

export default function TimeSince({
  date,
  ...props
}: { date: string } & React.ComponentProps<"time">) {
  return (
    <time dateTime={date} {...props}>
      {dayjs(date).fromNow()}
    </time>
  );
}