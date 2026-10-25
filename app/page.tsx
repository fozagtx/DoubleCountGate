import { Connect } from "@/components/Connect";
import { GateApp } from "@/components/GateApp";
import { Header } from "@/components/Header";
import { RunNotes } from "@/components/RunNotes";
import { Story } from "@/components/Story";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Story />
        <Connect />
        <GateApp />
        <RunNotes />
      </main>
    </>
  );
}
