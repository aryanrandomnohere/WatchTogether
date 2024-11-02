export default function Chatbox() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-2">
          {/* Messages go here */}
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          className="mt-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
  