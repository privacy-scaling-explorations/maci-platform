import { LayoutWithBallot } from "~/layouts/DefaultLayout";

const Discussions = (): JSX.Element => (
  <div className="">
    <LayoutWithBallot eligibilityCheck showBallot sidebarComponent={null}>
      <div className="mb-8 text-5xl font-bold text-[#222133]">Your Discussions</div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        <a
          className="flex h-[200px] w-full items-center justify-center rounded-lg border-4 border-[#222133] bg-[#B6CDEC] p-6 hover:bg-[#222133]"
          href="/Discussions/Proposals"
        >
          <div className="text-2xl font-bold text-[#222133] hover:text-[#B6CDEC]">Budget for 2024</div>
        </a>

        <a
          className="flex h-[200px] w-full items-center justify-center rounded-lg border-4 border-[#222133] bg-[#B6CDEC] p-6 hover:bg-[#222133]"
          href="/Discussions/Proposals"
        >
          <div className="text-2xl font-bold text-[#222133] hover:text-[#B6CDEC]">New President</div>
        </a>

        <a
          className="flex h-[200px] w-full items-center justify-center rounded-lg border-4 border-[#222133] bg-[#B6CDEC] p-6 hover:bg-[#222133]"
          href="/Discussions/Proposals"
        >
          <div className="text-2xl font-bold text-[#222133] hover:text-[#B6CDEC]">Defining next meet-up</div>
        </a>

        <a
          className="flex h-[200px] w-full items-center justify-center rounded-lg border-4 border-[#222133] bg-[#222133] p-6"
          href="/new"
        >
          {/* This is when MACI starts */}
          <div className="text-2xl font-bold text-[#B6CDEC]">Create new discussion</div>
        </a>
      </div>
    </LayoutWithBallot>
  </div>
);

export default Discussions;
