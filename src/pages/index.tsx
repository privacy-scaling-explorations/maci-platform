import { LayoutWithBallot } from "~/layouts/DefaultLayout";

const App = (): JSX.Element => (
  <div className="">
    <LayoutWithBallot eligibilityCheck showBallot sidebarComponent={null}>
      <div className="mb-8 text-5xl font-bold text-[#222133]">Your Organizations</div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        <a
          className="flex h-[200px] w-full items-center justify-center rounded-lg border-4 border-[#222133] bg-[#B6CDEC] p-6 hover:bg-[#222133]"
          href="/Discussions"
        >
          <div className="text-2xl font-bold text-[#222133] hover:text-[#B6CDEC]">Club de Blockchain / UTDT</div>
        </a>

        <a
          className="flex h-[200px] w-full items-center justify-center rounded-lg border-4 border-[#222133] bg-[#222133] p-6"
          href="/new"
        >
          <div className="text-2xl font-bold text-[#B6CDEC]">Create new organization</div>
        </a>
      </div>
    </LayoutWithBallot>
  </div>
);

export default App;
