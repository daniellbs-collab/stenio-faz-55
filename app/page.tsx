import { Hero } from "@/components/sections/Hero";
import { EventDetails } from "@/components/sections/EventDetails";
import { Venue } from "@/components/sections/Venue";
import { Rsvp } from "@/components/sections/Rsvp";
import { Guestbook } from "@/components/sections/Guestbook";
import { Quiz } from "@/components/sections/Quiz";

export default function Home() {
  return (
    <main id="conteudo">
      <Hero />
      <EventDetails />
      <Venue />
      <Rsvp />
      <Guestbook />
      <Quiz />
    </main>
  );
}
