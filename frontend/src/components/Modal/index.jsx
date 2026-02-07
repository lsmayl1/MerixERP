import React from "react";
import { CloseIcon } from "../../assets/Buttons/Close";
import { ModalClose } from "../../assets/Buttons/ModalClose";

export const BaseModal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop bg-MaingBg/30 absolute flex items-center justify-center w-full h-full top-0 right-0"
      onClick={onClose}
    >
      <div
        className="modal border bg-white border-mainBorder w-1/2  flex rounded-lg p-4 gap-6 flex-col "
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header flex justify-between items-center">
          <h2 className="font-medium text-xl">{title}</h2>
          <button onClick={onClose}>
            <ModalClose className={"size-8"} />
          </button>
        </header>

        <section className="modal-body">{children}</section>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
};
