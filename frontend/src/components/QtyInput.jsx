import React, { useEffect, useState } from "react";
import { Minus } from "../assets/Buttons/Minus";
import { Plus } from "../assets/Buttons/Plus";

export const QtyInput = ({ barcode, handleQty, qty, className, allign }) => {
  const [newQty, setNewQty] = useState(parseFloat(qty).toFixed(2) || 0);
  useEffect(() => {
    if (qty == undefined || qty == null) {
      setNewQty(0);
    } else {
      setNewQty(parseFloat(qty).toFixed(2) || 0);
    }
  }, [qty]);

  const handleChangeQty = (e, barcode, action) => {
    e.stopPropagation();
    handleQty(barcode, action);
  };
  return (
    <div className={`flex items-center ${allign} `}>
      <button
        onClick={(e) => handleChangeQty(e, barcode, "decrease")}
        className="bg-white border border-mainBorder rounded-lg p-0.5"
      >
        <Minus className="size-4 text-black" />
      </button>
      <input
        type="number"
        step={0.01}
        className={`${className} rounded-lg  w-1/5 text-center  text-black`}
        value={newQty}
        onChange={(e) => setNewQty(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleQty(barcode, null, newQty);
          }
        }}
        onBlur={() => handleQty(barcode, null, newQty)}
      />

      <button
        onClick={(e) => handleChangeQty(e, barcode, "increase")}
        className="bg-white border border-mainBorder rounded-lg p-0.5"
      >
        <Plus className="size-4 text-black" />
      </button>
    </div>
  );
};
