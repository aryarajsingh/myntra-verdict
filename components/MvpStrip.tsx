export function MvpStrip({ line }: { line?: string }) {
  return (
    <div className="mvp-strip">
      <p>
        <b>This is the product.</b>{" "}
        {line ??
          "A wishlist that keeps fit and return on the saved item. Demo sizes are loaded. Open a Check fit card → See Verdict."}
      </p>
    </div>
  );
}
