import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraIcon, LoaderIcon } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfile } from "../lib/api";
import UserAvatar from "./UserAvatar";

const ProfilePictureEditor = ({ user }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(user?.profilePic || "");
  const queryClient = useQueryClient();

  const { mutate: saveProfilePic, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success("Profile picture updated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Could not update profile picture");
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Image must be smaller than 1.5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;
      setPreview(imageDataUrl);
      saveProfilePic({ profilePic: imageDataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="relative block" aria-label="Edit profile picture">
        <UserAvatar src={preview} name={user?.fullName} className="w-9 rounded-full" />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-primary-content">
          {isPending ? <LoaderIcon className="size-3 animate-spin" /> : <CameraIcon className="size-3" />}
        </span>
      </button>

      <div
        tabIndex={0}
        className="dropdown-content mt-3 w-64 rounded-lg border border-base-300 bg-base-200 p-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <UserAvatar src={preview} name={user?.fullName} className="size-14 rounded-full" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user?.fullName}</p>
            <p className="text-xs opacity-70">Profile picture</p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm mt-4 w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          Choose from device
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ProfilePictureEditor;
