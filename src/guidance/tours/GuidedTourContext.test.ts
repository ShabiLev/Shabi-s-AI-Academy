import { describe, expect, it } from "vitest";
import {
  hasVisibleBlockingDialog,
  isActuallyVisible,
  isWalkthroughEligibleRoute,
} from "./GuidedTourContext";

describe("WALK ME route eligibility", () => {
  it("allows shell routes including Dashboard and safe deep links", () => {
    expect(isWalkthroughEligibleRoute("/dashboard")).toBe(true);
    expect(isWalkthroughEligibleRoute("/help")).toBe(true);
    expect(isWalkthroughEligibleRoute("/radar")).toBe(true);
  });

  it("excludes landing, onboarding, authentication, account, and admin routes", () => {
    for (const route of [
      "/",
      "/onboarding",
      "/auth/login",
      "/auth/callback",
      "/account/security",
      "/admin",
      "/admin/users",
    ]) {
      expect(isWalkthroughEligibleRoute(route)).toBe(false);
    }
  });
});

describe("WALK ME blocking dialog visibility", () => {
  it("detects visible dialog geometry", () => {
    const dialog = document.createElement("section");
    dialog.setAttribute("role", "dialog");
    dialog.style.display = "block";
    dialog.style.visibility = "visible";
    dialog.getBoundingClientRect = () => ({
      width: 320,
      height: 180,
      top: 0,
      right: 320,
      bottom: 180,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.append(dialog);
    expect(isActuallyVisible(dialog)).toBe(true);
    expect(hasVisibleBlockingDialog()).toBe(true);
    dialog.remove();
  });

  it("ignores hidden dialog markup", () => {
    const dialog = document.createElement("section");
    dialog.setAttribute("aria-modal", "true");
    dialog.hidden = true;
    dialog.getBoundingClientRect = () => ({
      width: 320,
      height: 180,
      top: 0,
      right: 320,
      bottom: 180,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.append(dialog);
    expect(isActuallyVisible(dialog)).toBe(false);
    expect(hasVisibleBlockingDialog()).toBe(false);
    dialog.remove();
  });
});
