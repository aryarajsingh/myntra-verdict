import type { Bucket, ReturnClass } from "@/data/types";

export function StatusChip({ bucket }: { bucket: Bucket }) {
  if (bucket === "ready") {
    return (
      <span className="chip chip-ready" aria-label="Status: Ready">
        <span className="dot" />
        READY
      </span>
    );
  }
  if (bucket === "check_fit") {
    return (
      <span className="chip chip-fit" aria-label="Status: Check fit">
        <span className="tri" />
        CHECK FIT
      </span>
    );
  }
  return (
    <span className="chip chip-explore" aria-label="Status: Still exploring">
      <span className="hol" />
      STILL EXPLORING
    </span>
  );
}

export function PolicyChip({ policy }: { policy: ReturnClass }) {
  const label =
    policy === "easy_return" ? "RETURNABLE" : policy === "exchange_only" ? "EXCHANGE ONLY" : "SEAL TAG STAYS ON";
  return <span className="chip chip-policy">{label}</span>;
}
