import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Calendar from "../../assets/Buttons/Calendar";
import { getDateRange } from "../utils/GetDateRange";
import { getRange, selectRange } from "../../redux/dateRange/dateRangeSlice";
import { useTranslation } from "react-i18next";

export const DateRange = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showDateModal, setShowDateModal] = useState(false);
  const state = useSelector((state) => state.dateRangeSlice);
  const [range] = useState([
    { name: t("today"), key: "today" },
    { name: t("yesterday"), key: "yesterday" },
    { name: t("thisWeek"), key: "thisWeek" },
    { name: t("lastWeek"), key: "lastWeek" },
    { name: t("thisMonth"), key: "thisMonth" },
    { name: t("lastMonth"), key: "lastMonth" },
    { name: t("thisYear"), key: "thisYear" },
  ]);
  const { start, end, startFormatted, endFormatted } = getDateRange(
    state.selectedRange,
  );

  const selectedRangeName =
    range.find((rg) => rg.key === state.selectedRange)?.name ||
    state.selectedRange;

  useEffect(() => {
    if (start && end) {
      // compare ISO strings to avoid Date vs string mismatch
      if (
        state.from === start.toISOString() &&
        state.to === end.toISOString()
      ) {
        return;
      }
      dispatch(
        getRange({
          from: start.toISOString(),
          to: end.toISOString(),
        }),
      );
    }
  }, [state.selectedRange, dispatch]);

  const handleSelect = (item) => {
    dispatch(selectRange(item.key));
    setShowDateModal(false);
  };
  return (
    <div className="flex w-full gap-4 justify-end  items-center">
      {startFormatted && endFormatted ? (
        <h1 className="text-xl font-medium text-black">
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

          {selectedRangeName}
        </button>
        {showDateModal && (
          <div className="flex bg-white shadow-2xl absolute top-12 z-50 rounded-md w-[140%] right-24">
            <div className="flex flex-col gap-12 flex-1 justify-between border-r border-mainBorder">
              <ul className="flex flex-col text-black w-full p-2">
                {range.map((rg, index) => (
                  <li
                    onClick={() => handleSelect(rg)}
                    key={index}
                    className="hover:bg-gray-100  text-md p-4  w-full text-nowrap rounded-md cursor-pointer"
                  >
                    {rg.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
