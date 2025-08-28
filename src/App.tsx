import { FaFileUpload } from "react-icons/fa"

export default function App() {
  return (
    <section className="h-screen flex flex-col gap-[2rem] justify-center items-center bg-black text-white">
      {/* the site title and the slogan lol  */}
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-[3.5rem] tracking-widest">zonewave.</h1>
        <h1 className="text-[1rem] italic tracking-widest">the best platform to slow your musics.</h1>
      </div>

      {/* the upload section */}
      <div className="py-[2rem] px-[5rem] border border-zinc-800 flex flex-col gap-[2rem] items-center justify-center">
        <h1>upload your music and your background image(optional)</h1>

        <div className="flex gap-[1rem] md:flex-row flex-col">
          {/* upload music box  */}
          <div className="flex flex-col justify-center items-center border border-dashed border-zinc-800 p-[3rem] rounded-lg">
            <FaFileUpload />
            <h1 className="mt-5">upload music</h1>
            <h1 className="italic text-[0.8rem] text-zinc-700">supported formats: mp3, wav</h1>
          </div>

          {/* upload background image box (optional) */}
          <div className="flex flex-col justify-center items-center border border-dashed border-zinc-800 p-[3rem] rounded-lg">
            <FaFileUpload />
            <h1 className="mt-5">upload image(optional)</h1>
            <h1 className="italic text-[0.8rem] text-zinc-700">supported formats: jpg, png</h1>
          </div>
        </div>

        {/* the slowed and reverbed function */}
        <div className="flex flex-col w-full gap-[1rem]">
          <div className="self-start w-full">
            <h1>how slowed do you want it to be?</h1>
            <input type="range" name="" id="" className="accent-zinc-800 w-full" />
          </div>

          <div className="self-start w-full">
            <h1>how reverbed do you want it to be?</h1>
            <input type="range" name="" id="" className="accent-zinc-800 w-full" />
          </div>
        </div>

        {/* the playback preview and the feature */}
        {/* <div>

        </div> */}

        {/* the export buttons */}
        <div className="flex gap-[1rem]">
          <button className="bg-zinc-800 p-[1rem] rounded-lg hover:bg-zinc-900 hover:cursor-pointer">export as mp3</button>
          <button className="bg-zinc-800 p-[1rem] rounded-lg hover:bg-zinc-900 hover:cursor-pointer">export as mp4</button>
        </div>
      </div>
    </section>
  )
}