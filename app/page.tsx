import { Faq } from "@/components/Faq";
import { Header } from "@/components/Header";
import { LandingRedirect } from "@/components/LandingRedirect";
import { Story } from "@/components/Story";

export default function Page() {
  return (
    <>
      <LandingRedirect />
      <Header />
      <main>
        <Story />
        <Faq />
      </main>
    </>
  );
}
