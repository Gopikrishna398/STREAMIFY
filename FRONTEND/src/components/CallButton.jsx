import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="absolute top-3 right-4 z-20">
      <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white shadow-md">
        <VideoIcon className="size-4" />
        <span className="hidden sm:inline">Start video call</span>
      </button>
    </div>
  );
}

export default CallButton;
