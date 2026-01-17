export const getDateRange = (filter) => {
  const now = new Date();

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avqust",
    "sentyabr",
    "oktyabr",
    "noyabr",
    "dekabr",
  ];

  const getStartOfDayUTC = (date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const getEndOfDayUTC = (date) =>
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

  const formatAzerbaijaniDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return { day: day, month: month, year: year };
  };

  let start, end;

  switch (filter) {
    case "today":
      start = getStartOfDayUTC(now);
      end = getEndOfDayUTC(now);
      break;

    case "yesterday":
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      start = getStartOfDayUTC(yesterday);
      end = getEndOfDayUTC(yesterday);
      break;

    case "thisWeek":
      // Haftanın ilk günü Pazartesi (1), son günü Pazar (7)
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Pazar 0 ise 7 yap
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      start = getStartOfDayUTC(monday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      end = getEndOfDayUTC(sunday);
      break;

    case "lastWeek":
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
      start = getStartOfDayUTC(lastWeekStart);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end = getEndOfDayUTC(end);
      break;

    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end = getEndOfDayUTC(end);
      break;

    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      end = getEndOfDayUTC(end);
      break;

    case "thisYear":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      end = getEndOfDayUTC(end);
      break;

    default:
      return {
        start: null,
        end: null,
        startFormatted: null,
        endFormatted: null,
      };
  }

  return {
    start,
    end,
    startFormatted: formatAzerbaijaniDate(start),
    endFormatted: formatAzerbaijaniDate(end),
  };
};
