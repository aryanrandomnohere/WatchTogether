export default function Chats({ chat }: { chat: { name: string; message: string; time: string } }) {
  return (
    <div className="bg-slate-800 border border-stone-800 bg-opacity-50 h-fit rounded p-2   text-xs  w-full  shadow-md">
      <div className=" pl-1.5">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-yellow-600 text-sm  ">{chat.name}</h4>
          <p className="text-gray-500 text-xs font-extralight ">{chat.time}</p>
        </div>
        <p className="text-white font-light max-h-96">{chat.message}</p>
      </div>
    </div>
  );
}