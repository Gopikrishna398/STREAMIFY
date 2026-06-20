import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CameraIcon, LoaderIcon, PencilIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthUser from "../hooks/useAuthUser";
import { updateProfile } from "../lib/api";
import { LANGUAGES } from "../constants";
import UserAvatar from "../components/UserAvatar";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  
  // Keep track of form state separate from authUser for edits
  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    gender: authUser?.gender || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    bio: authUser?.bio || "",
    profilePic: "", 
  });
  
  const [preview, setPreview] = useState(authUser?.profilePic || "");

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      // reset the profilePic in formState since it's now updated on the backend
      setFormState((prev) => ({ ...prev, profilePic: "" }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
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
      setFormState({ ...formState, profilePic: imageDataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Basic validation
    if (!formState.fullName || !formState.email) {
      toast.error("Full Name and Email are required");
      return;
    }
    updateProfileMutation(formState);
  };

  const handleCancel = () => {
    // Revert form state back to authUser
    setFormState({
      fullName: authUser?.fullName || "",
      email: authUser?.email || "",
      gender: authUser?.gender || "",
      nativeLanguage: authUser?.nativeLanguage || "",
      learningLanguage: authUser?.learningLanguage || "",
      location: authUser?.location || "",
      bio: authUser?.bio || "",
      profilePic: "",
    });
    setPreview(authUser?.profilePic || "");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-base-200 rounded-3xl shadow-xl overflow-hidden border border-base-300 relative">
        
        {/* Header section */}
        <div className="p-6 sm:p-8 border-b border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
              <ArrowLeftIcon className="size-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar 
                  src={preview} 
                  name={authUser?.fullName} 
                  className="size-16 sm:size-20 rounded-full border-4 border-base-100 shadow-sm" 
                />
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-content hover:scale-110 transition-transform shadow-md"
                  >
                    <CameraIcon className="size-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{authUser?.fullName}</h1>
                <p className="text-sm text-success flex items-center gap-1.5 mt-1 font-medium">
                  <span className="size-2 rounded-full bg-success inline-block shadow-sm shadow-success/50" />
                  Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn btn-outline btn-sm sm:btn-md gap-2 rounded-full px-6"
              >
                <PencilIcon className="size-4" />
                Edit
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCancel} 
                  className="btn btn-ghost btn-sm sm:btn-md rounded-full px-6"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="btn btn-primary btn-sm sm:btn-md rounded-full px-8 shadow-lg shadow-primary/20"
                  disabled={isPending}
                >
                  {isPending ? <LoaderIcon className="size-4 animate-spin" /> : "Save"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="p-6 sm:p-10 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* FULL NAME (Only shown in edit mode, shown in header in view mode) */}
            {isEditing && (
              <div className="form-control col-span-1 md:col-span-2">
                <label className="label py-1"><span className="label-text font-medium text-base-content/70">Full Name</span></label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="Your full name"
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-base-content/70 mb-2">Email</span>
              {!isEditing ? (
                <span className="text-base font-medium">{authUser?.email}</span>
              ) : (
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="Email"
                />
              )}
            </div>

            {/* GENDER */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-base-content/70 mb-2">Gender</span>
              {!isEditing ? (
                <span className="text-base font-medium capitalize">{authUser?.gender || "Not specified"}</span>
              ) : (
                <select
                  value={formState.gender}
                  onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                  className="select select-bordered w-full focus:select-primary transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              )}
            </div>

            {/* NATIVE LANGUAGE */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-base-content/70 mb-2">Native Language</span>
              {!isEditing ? (
                <span className="text-base font-medium capitalize">{authUser?.nativeLanguage || "Not specified"}</span>
              ) : (
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full focus:select-primary transition-all capitalize"
                >
                  <option value="">Select Language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* LEARNING LANGUAGE */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-base-content/70 mb-2">Learning Language</span>
              {!isEditing ? (
                <span className="text-base font-medium capitalize">{authUser?.learningLanguage || "Not specified"}</span>
              ) : (
                <select
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full focus:select-primary transition-all capitalize"
                >
                  <option value="">Select Language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* LOCATION */}
            <div className="flex flex-col col-span-1 md:col-span-2">
              <span className="text-sm font-medium text-base-content/70 mb-2">Location</span>
              {!isEditing ? (
                <span className="text-base font-medium">{authUser?.location || "Not specified"}</span>
              ) : (
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="City, Country"
                />
              )}
            </div>

            {/* BIO */}
            <div className="flex flex-col col-span-1 md:col-span-2">
              <span className="text-sm font-medium text-base-content/70 mb-2">Bio</span>
              {!isEditing ? (
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {authUser?.bio || "No bio provided."}
                </p>
              ) : (
                <textarea
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
