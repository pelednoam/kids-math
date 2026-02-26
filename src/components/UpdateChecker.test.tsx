import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdateChecker } from "./UpdateChecker";

// Stub the global __BUILD_TIME__ injected by Vite
vi.stubGlobal("__BUILD_TIME__", "2026-01-15T10:30:00.000Z");

describe("UpdateChecker", () => {
  const originalFetch = globalThis.fetch;
  const reloadMock = vi.fn();

  beforeEach(() => {
    // Mock location.reload since jsdom doesn't support navigation
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    reloadMock.mockReset();
  });

  it("renders the check for updates button", () => {
    render(<UpdateChecker />);
    expect(
      screen.getByRole("button", { name: "Check for Updates" })
    ).toBeInTheDocument();
  });

  it("shows up-to-date message with build date when versions match", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ buildTime: "2026-01-15T10:30:00.000Z" }),
    });

    render(<UpdateChecker />);
    await user.click(screen.getByRole("button", { name: "Check for Updates" }));

    await waitFor(() => {
      expect(screen.getByText(/Up to date/)).toBeInTheDocument();
    });
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("reloads the page when a newer version is available", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ buildTime: "2026-02-20T12:00:00.000Z" }),
    });

    render(<UpdateChecker />);
    await user.click(screen.getByRole("button", { name: "Check for Updates" }));

    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalledOnce();
    });
  });

  it("shows error message when fetch fails", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    render(<UpdateChecker />);
    await user.click(screen.getByRole("button", { name: "Check for Updates" }));

    await waitFor(() => {
      expect(
        screen.getByText("Could not check for updates")
      ).toBeInTheDocument();
    });
  });

  it("shows error message when server returns non-ok response", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    render(<UpdateChecker />);
    await user.click(screen.getByRole("button", { name: "Check for Updates" }));

    await waitFor(() => {
      expect(
        screen.getByText("Could not check for updates")
      ).toBeInTheDocument();
    });
  });

  it("disables the button while checking", async () => {
    const user = userEvent.setup();
    // Use a promise we control to keep the fetch pending
    let resolveFetch!: (v: unknown) => void;
    globalThis.fetch = vi.fn().mockReturnValue(
      new Promise((r) => {
        resolveFetch = r;
      })
    );

    render(<UpdateChecker />);
    await user.click(screen.getByRole("button", { name: "Check for Updates" }));

    expect(screen.getByRole("button", { name: "Checking…" })).toBeDisabled();

    // Resolve to let component settle
    resolveFetch({
      ok: true,
      json: () => Promise.resolve({ buildTime: "2026-01-15T10:30:00.000Z" }),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Check for Updates" })
      ).toBeEnabled();
    });
  });

  it("fetches version.json with a cache-busting query param", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ buildTime: "2026-01-15T10:30:00.000Z" }),
    });
    globalThis.fetch = fetchMock;

    render(<UpdateChecker />);
    await user.click(screen.getByRole("button", { name: "Check for Updates" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledOnce();
    });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toMatch(/^\/version\.json\?t=\d+$/);
  });
});
