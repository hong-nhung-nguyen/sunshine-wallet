const stories = [
  {
    step: "Identify",
    title: "Find local sunshine",
    description: "Spot where flexible demand can help the network.",
    tone: "bg-[var(--primary)]",
  },
  {
    step: "Verify",
    title: "Prove real impact",
    description: "Compare measured response with an honest baseline.",
    tone: "bg-[var(--council-ink)]",
  },
  {
    step: "Share",
    title: "Distribute value fairly",
    description: "Reward contributors and protect community equity.",
    tone: "bg-[var(--wallet)]",
  },
] as const;

export function RotatingStoryCards() {
  return (
    <div
      className="hero-story-stack"
      aria-label="Sunshine Wallet identifies opportunities, verifies impact and shares value"
    >
      {stories.map((story, index) => (
        <div
          key={story.step}
          className={`hero-story-badge ${story.tone} text-white shadow-xl`}
        >
          <p className="font-mono text-xs font-semibold tracking-[0.14em] text-white/70 uppercase">
            0{index + 1} · {story.step}
          </p>
          <h2 className="mt-3 text-center text-xl leading-tight font-semibold">
            {story.title}
          </h2>
          <p className="mt-3 max-w-40 text-center text-sm leading-5 text-white/75">
            {story.description}
          </p>
        </div>
      ))}
    </div>
  );
}
