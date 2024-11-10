export default function Chats({ chat }: { chat: { name: string; message: string; time: string } }) {
  return (
    <div className="bg-slate-800 bg-opacity-50 rounded p-2 text-xs sm:text-base w-full mb-2 shadow-md">
      <div className="ml-1 pl-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-yellow-600">{chat.name}</h4>
          <p className="text-gray-500 text-xs mr-2">{chat.time}</p>
        </div>
        <p className="text-gray-300">{chat.message}</p>
      </div>
    </div>
  );
}
