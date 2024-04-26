export function Footer() {
  return (
    <footer className="flex bg-PGFBrown justify-center items-center px-12">
      <div className="max-w-screen-2xl mx-auto flex justify-between w-full">
        <div className="flex items-center space-x-6">
          <img src="/images/x-icon.png" className="h-10" alt="X Icon" />
          <img src="/images/telegram-icon.png" className="h-10" alt="Telegram Icon" />
        </div>
        <div className="flex items-center space-x-6 text-white">
          <h1>Una iniciativa de</h1>
          <img src="/images/ETHMx-icon.png" className="h-24 py-2 my-2" alt="ETHMx Icon" />
        </div>
      </div>
    </footer>
  );
}

