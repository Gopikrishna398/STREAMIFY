import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, absolute = true }) {
  const button = (
    <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white shadow-md">
      <VideoIcon className="size-4 mr-1.5" />
      <span className="hidden sm:inline">Start video call</span>
    </button>
  );

  if (!absolute) return button;

  return (
    <div className="absolute top-3 right-16 z-20">
      {button}
    </div>
  );
}

export default CallButton;
