"use client";

import { useCallback } from "react";

export function BaseContactAlert({ baseContact }: { baseContact: string }) {
  const isRequired = !baseContact.toLowerCase().includes("no base contact");
  const handleCallBase = useCallback(() => {
    const event = new CustomEvent("base-contact", { detail: { message: baseContact } });
    window.dispatchEvent(event);
  }, [baseContact]);

  return (
    <div
      className={`base-contact-alert ${isRequired ? "required" : "not-required"}`}
      data-section="base-contact"
    >
      <div className="base-contact-icon" aria-hidden="true">{isRequired ? "" : ""}</div>
      <div className="base-contact-content">
        <p>{baseContact}</p>
      </div>
      {isRequired && (
        <button
          type="button"
          onClick={handleCallBase}
          className="action-button-primary"
          style={{ minWidth: "auto", padding: "8px 16px", minHeight: "48px" }}
        >
          Call Now
        </button>
      )}
    </div>
  );
}


