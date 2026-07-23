/**
 * Clock widget: renders the current local time and re-aligns to the next
 * minute boundary so the display never drifts behind the wall clock.
 */
export function createClockModel({ els }) {
  function tick() {
    const now = new Date();
    els.clock.textContent = now.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function start() {
    tick();
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    setTimeout(function scheduleAlignedTick() {
      tick();
      setInterval(tick, 60_000);
    }, msUntilNextMinute);
  }

  return { start, tick };
}