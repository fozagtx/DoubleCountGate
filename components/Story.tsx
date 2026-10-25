import { BlockIcon, CheckIcon, DocIcon, EyeIcon, FingerprintIcon, ShieldIcon, SparkIcon } from "@/components/Icons";
import { WalletEntryButton } from "@/components/WalletEntryButton";

const photos = [
  { src: "/photos/auditor.jpg", alt: "An auditor reviewing printed forest monitoring reports", tilt: "-rotate-[4deg] translate-y-6" },
  { src: "/photos/nursery.jpg", alt: "A nursery worker holding a tray of tree seedlings", tilt: "-rotate-[2deg] translate-y-2" },
  { src: "/photos/ranger.jpg", alt: "A forest ranger measuring the trunk of a pine tree", tilt: "rotate-0 -translate-y-2 scale-[1.04] z-10" },
  { src: "/photos/canopy.jpg", alt: "Aerial view of forest canopy along a river", tilt: "rotate-[4deg] translate-y-6" },
];

const steps = [
  {
    icon: DocIcon,
    title: "Add the forest report",
    body: "Paste the monitoring report that proves how much carbon a project removed, or start with our example.",
  },
  {
    icon: FingerprintIcon,
    title: "We give it a fingerprint",
    body: "The key facts (project, method, dates, tonnes, report ID) turn into a unique code. Same report, same code. Every time.",
  },
  {
    icon: ShieldIcon,
    title: "Issue the credit once",
    body: "You approve the credit from your wallet. The fingerprint is recorded on a public registry for anyone to check.",
  },
  {
    icon: BlockIcon,
    title: "Copies are refused",
    body: "If anyone tries to issue another credit from the same report, the registry says no. Automatically. No meetings needed.",
  },
];

export function Story() {
  return (
    <div id="top">
      <section className="mx-auto max-w-marketing px-5 pb-10 pt-14 text-center md:px-8 md:pt-20">
        <p className="inline-flex items-center gap-2 rounded-md bg-sand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-lead">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden />
          For carbon registries &amp; project developers
        </p>
        <h1 className="mx-auto mt-6 max-w-[15ch] font-display text-[44px] font-bold leading-[0.98] tracking-[-0.045em] text-ink sm:text-[60px] md:text-[78px]">
          One forest report. One credit. Never two.
        </h1>
        <p className="mx-auto mt-6 max-w-[34rem] text-[17px] leading-relaxed text-lead md:text-lg">
          When the same report is used to issue two carbon credits, the climate only wins once, and buyers stop trusting
          the market. Faircri makes sure every report can back exactly one credit.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <WalletEntryButton
            label="Connect wallet to start"
            connectedLabel="Go to dashboard"
            className="btn w-full sm:w-auto"
          />
          <a href="#how" className="btn-ghost w-full sm:w-auto">
            See how it works
          </a>
        </div>
        <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-lead">
          <li className="flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4 text-forest" /> Free to try, no sign-up
          </li>
          <li className="flex items-center gap-1.5">
            <SparkIcon className="h-4 w-4 text-forest" /> AI helps read reports, never issues credits
          </li>
          <li className="flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4 text-forest" /> Every credit is publicly checkable
          </li>
        </ul>
      </section>

      <section className="overflow-hidden pb-20 pt-6 md:pb-28" aria-label="People working on forest projects">
        <div className="mx-auto flex max-w-marketing justify-center gap-3 px-5 md:gap-4 md:px-8">
          {photos.map((photo, index) => (
            <div
              key={photo.src}
              className={`relative aspect-[3/4] w-[44%] shrink-0 overflow-hidden rounded-[14px] shadow-lift sm:w-[30%] md:w-[19%] ${photo.tilt} ${
                index === 0 || index === 4 ? "hidden md:block" : index === 1 ? "hidden sm:block" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t border-line bg-sheet">
        <div className="mx-auto max-w-marketing px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">How it works</p>
            <h2 className="mt-3 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] md:text-[48px]">
              Double counting, stopped before it starts.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-lead">
              Four steps. You only do the first and the third. The rest happens on its own.
            </p>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-[16px] border border-line bg-paper p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-sheet text-forest shadow-card">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-sm font-semibold text-mute">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-[19px] font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-lead">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
