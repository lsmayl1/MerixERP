import React, { useEffect, useState } from "react";
import { Plus } from "../../assets/Plus";
import { SearchIcon } from "../../assets/SearchIcon";

export const SearchModal = ({
  data,
  handleAdd,
  setQuery,
  query,
  barcodeRef,
}) => {
  const searchInput = React.useRef(null);
  const modalRef = React.useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [input, setInput] = useState("");

  const handleQuery = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      setQuery(input);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === "k") {
        e.preventDefault();
        searchInput.current?.focus();
      } else if (key === "escape") {
        setQuery("");
        setFocusedIndex(-1);
        barcodeRef.current?.focus();
      } else if (key === "arrowdown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
      } else if (key === "arrowup") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (
        key === "enter" &&
        focusedIndex >= 0 &&
        query.trim().length > 0
      ) {
        if (data[focusedIndex]) {
          handleAdd(data[focusedIndex].barcode, "increase");
        }
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [data, focusedIndex]);

  return (
    <div className="flex flex-col relative w-1/2">
      <div className="flex items-center  relative w-full">
        <input
          type="text"
          ref={searchInput}
          placeholder="Search for products"
          className="border border-mainBorder rounded-lg py-2 px-10 w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => handleQuery(e)}
        />
        <SearchIcon className="absolute left-2" />
        <div className="flex absolute text-gray-400 right-1 gap-4">
          <div className="">
            <span className="bg-gray-50 p-1 border border-mainBorder rounded-lg">
              Ctrl
            </span>
            <span className=" p-1 ">+</span>
            <span className="bg-gray-50 p-1 border border-mainBorder rounded-lg">
              K
            </span>
          </div>
        </div>
      </div>
      {data?.length > 0 && query && (
        <div className="absolute w-full h-[400px] z-50 top-12 bg-white rounded-lg border border-mainBorder">
          <ul
            ref={modalRef}
            className="overflow-auto h-full px-4 flex flex-col  "
          >
            {data?.map((item, index) => (
              <li
                key={item.product_id}
                className={`${
                  focusedIndex === index ? "bg-gray-300" : ""
                } flex items-center justify-between hover:bg-gray-100 px-4 py-2`}
              >
                <div className="flex gap-4 w-1/2">
                  <span className="flex-2">{item.name}</span>
                  <span>{item?.stock.current_stock}</span>
                </div>
                <span>{item.sellPrice + " ₼" || 0.0} </span>

                <button
                  onClick={() => handleAdd(item.barcode, "increase")}
                  className="p-1 mr-12 bg-white border border-mainBorder rounded-lg"
                >
                  <Plus className="size-6" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
