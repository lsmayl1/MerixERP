import React, { useEffect, useState } from "react";
import Calendar from "../../assets/Calendar";
import { getDateRange } from "../utils/GetDateRange";
import { useTranslation } from "react-i18next";

export const DateRange = ({ handleRange }) => {
  const { t } = useTranslation();
  const [showDateModal, setShowDateModal] = useState(false);

  const [range, setRange] = useState([
    { name: t("today"), key: "today" },
    { name: t("yesterday"), key: "yesterday" },
    { name: t("thisWeek"), key: "thisWeek" },
    { name: t("lastWeek"), key: "lastWeek" },
    { name: t("thisMonth"), key: "thisMonth" },
    { name: t("lastMonth"), key: "lastMonth" },
    { name: t("thisYear"), key: "thisYear" },
  ]);
  const [selectedRange, setSelectedRange] = useState(range[0]);
  const { start, end, startFormatted, endFormatted } = getDateRange(
    selectedRange?.key,
  );

  useEffect(() => {
    if (start && end && handleRange) {
      handleRange({
        from: start,
        to: end,
      });
    }
  }, [selectedRange]);

  const handleSelect = (item) => {
    setSelectedRange(item);
    setShowDateModal(false);
  };
  return (
    <div className="flex w-full gap-4 justify-end p-2 items-center">
      {startFormatted && endFormatted ? (
        <h1 className="text-xl font-semibold">
          {`${startFormatted.day} ${startFormatted.month} - ${endFormatted.day} ${endFormatted.month} `}
          {startFormatted.year === endFormatted.year ? (
            <span className="text-md text-mainText">{startFormatted.year}</span>
          ) : (
            <span className="text-md text-mainText">
              {startFormatted.year} - {endFormatted.year}
            </span>
          )}
        </h1>
      ) : (
        <h1>Date not Selected</h1>
      )}

      <div className="flex items-center relative">
        <button
          onClick={() => setShowDateModal(!showDateModal)}
          className="flex gap-4 items-center bg-white py-2 px-4 rounded-md border border-mainBorder text-md"
        >
          <Calendar />

          {selectedRange.name}
        </button>
        {showDateModal && (
          <div className="flex bg-white shadow-2xl absolute top-12 z-50 rounded-md w-[100%] right-24">
            <div className="flex flex-col gap-12 flex-1 justify-between border-r border-mainBorder">
              <ul className="flex flex-col text-black">
                {range.map((rg, index) => (
                  <li
                    onClick={() => handleSelect(rg)}
                    key={index}
                    className="hover:bg-gray-100 p-3 text-md  rounded-md cursor-pointer"
                  >
                    {rg.name}
                  </li>
                ))}
              </ul>
            </div>
            {/* <div className="flex-3"></div */}
          </div>
        )}
      </div>
    </div>
  );
};
