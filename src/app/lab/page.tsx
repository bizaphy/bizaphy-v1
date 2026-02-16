import LabList from "./components/LabList";
import TextScramble from "@/app/components/effects/TextScramble";


export default function LabPage() {
  return (
    <section className="relative space-y-8">
      <div className="relative z-10 space-y-8">
        <h1 className="text-3xl font-bold">
          <TextScramble text="Neon Lab" />
        </h1>
        <LabList />
      </div>
    </section>
  );
}
