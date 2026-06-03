import { useRef, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { CameraIcon, LoaderIcon, MapPinIcon, ShipWheelIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    gender: authUser?.gender || "",
    profilePic: "",
  });

  const [preview, setPreview] = useState(authUser?.profilePic || "");

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (data) => {
      toast.success("Profile onboarded successfully");
      queryClient.setQueryData(["authUser"], data);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to complete onboarding");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>
          <p className="text-center text-sm opacity-70 mb-8">Please fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <button 
                type="button"
                className="relative block" 
                aria-label="Upload profile picture"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <UserAvatar
                  src={preview}
                  name={formState.fullName || authUser?.fullName}
                  className="size-32 rounded-full border-4 border-base-300 hover:border-primary transition-colors cursor-pointer"
                />
                <span className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-content shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                  <CameraIcon className="size-5" />
                </span>
              </button>
              <div className="text-center">
                <p className="font-semibold text-sm">Upload Profile Picture</p>
                <p className="text-xs opacity-70">Optional</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* GENDER */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Gender <span className="text-error">*</span></span>
              </label>
              <div className="flex gap-4 p-2">
                <label className="label cursor-pointer gap-2 border border-base-300 rounded-lg px-4 py-2 hover:bg-base-300 transition-colors flex-1">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Male"
                    className="radio radio-primary" 
                    checked={formState.gender === "Male"}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                    required 
                  />
                  <span className="label-text">Male</span>
                </label>
                <label className="label cursor-pointer gap-2 border border-base-300 rounded-lg px-4 py-2 hover:bg-base-300 transition-colors flex-1">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Female"
                    className="radio radio-primary" 
                    checked={formState.gender === "Female"}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                    required 
                  />
                  <span className="label-text">Female</span>
                </label>
                <label className="label cursor-pointer gap-2 border border-base-300 rounded-lg px-4 py-2 hover:bg-base-300 transition-colors flex-1">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Other"
                    className="radio radio-primary" 
                    checked={formState.gender === "Other"}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                    required 
                  />
                  <span className="label-text">Other</span>
                </label>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full focus:input-primary transition-all"
                placeholder="Your full name"
                required
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24 focus:textarea-primary transition-all"
                placeholder="Tell others about yourself and your language learning goals"
                required
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full focus:select-primary transition-all"
                  required
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full focus:select-primary transition-all"
                  required
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full mt-4" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Saving...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
