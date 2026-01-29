import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";

export const BarcodeField = forwardRef(
  ({ handleBarcode, shouldFocus = true }, ref) => {
    const [barcode, setBarcode] = useState("");
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current && inputRef.current.focus();
      },
    }));

    useEffect(() => {
      if (shouldFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [shouldFocus]);

    useEffect(() => {
      const handleClick = (event) => {
        if (!event.target.matches("input, button,span")) {
          if (shouldFocus && inputRef.current) {
            inputRef.current.focus();
          }
        }
      };

      document.addEventListener("click", handleClick);

      return () => {
        document.removeEventListener("click", handleClick);
      };
    }, []);

    const handleKey = (e) => {
      if (e.key == "Enter" && barcode.length > 0) {
        handleBarcode(barcode.trim());
        setBarcode("");
      }
    };

    return (
      <input
        value={barcode}
        ref={inputRef}
        type="number"
        onChange={(e) => setBarcode(e.target.value)}
        className="caret-transparent"
        cursor="pointer"
        onKeyDown={handleKey}
      />
    );
  }
);
