import React from "react";

export const KPI = ({ data, children }) => {
  return (
    <div
      className={`grid  max-md:grid-cols-2  gap-2 w-full`}
      style={{
        gridTemplateColumns: `repeat(${children ? data?.length + 1 : data?.length || 1}, minmax(0, 1fr))`,
      }}
    >
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white w-full  h-full justify-between px-4 py-4  rounded-lg flex flex-col gap-2"
        >
          <label className="text-mainText text-nowrap max-md:text-xs font-medium capitalize">
            {item.label}
          </label>
          <span className="text-3xl font-semibold max-md:text-2xl text-nowrap">
            {item.value || 0}
          </span>
        </div>
      ))}
      {children}
    </div>
  );
};
