import { useRef, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { Camera, MapPin, Compass, User, FileText, Globe } from "lucide-react";
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
      toast.success("Profile completed successfully!");
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
    if (!formState.gender) {
      toast.error("Please select a gender");
      return;
    }
    onboardingMutation(formState);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden bg-slate-950">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-secondary/15 blur-[140px] animate-pulse"></div>

      <div className="relative w-full max-w-3xl p-6 md:p-10 bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Complete Your Profile
          </h1>
          <p className="text-sm text-slate-400 max-w-md">
            Help us customize your language exchange experience by filling in your details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Picture Uploader */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <button
              type="button"
              className="group relative block rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-primary to-secondary opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
              <div className="relative size-32 rounded-full overflow-hidden border-4 border-slate-950 bg-slate-900">
                <UserAvatar
                  src={preview}
                  name={formState.fullName || authUser?.fullName}
                  className="size-full object-cover"
                />
              </div>
              <span className="absolute bottom-1 right-1 rounded-full bg-primary p-2.5 text-white shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
                <Camera className="size-4" />
              </span>
            </button>
            <div className="text-center">
              <p className="font-semibold text-sm text-slate-200">Profile Picture</p>
              <p className="text-xs text-slate-400">Optional (Click avatar to change)</p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Gender Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <User className="size-4 text-primary" />
              Gender <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Male", "Female", "Other"].map((gen) => (
                <label
                  key={gen}
                  className={`flex items-center justify-center gap-2 border-2 rounded-xl py-3 px-4 cursor-pointer text-sm font-medium transition-all duration-300 ${
                    formState.gender === gen
                      ? "border-primary bg-primary/10 text-white shadow-md shadow-primary/10"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gen}
                    checked={formState.gender === gen}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                    className="hidden"
                    required
                  />
                  <span>{gen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <User className="size-4 text-primary" />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
              className="input w-full bg-slate-950/80 text-white border-2 border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formState.bio}
              onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
              className="textarea w-full bg-slate-950/80 text-white border-2 border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all h-24 placeholder:text-slate-600"
              placeholder="Tell others about yourself and your language exchange goals..."
              required
            />
          </div>

          {/* Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Native Language */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="size-4 text-primary" />
                Native Language
              </label>
              <select
                name="nativeLanguage"
                value={formState.nativeLanguage}
                onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                className="select w-full bg-slate-950/80 text-white border-2 border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                required
              >
                <option value="" disabled className="bg-slate-950 text-slate-400">Select native language</option>
                {LANGUAGES.map((lang) => (
                  <option key={`native-${lang}`} value={lang.toLowerCase()} className="bg-slate-950 text-white">
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Learning Language */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="size-4 text-primary" />
                Learning Language
              </label>
              <select
                name="learningLanguage"
                value={formState.learningLanguage}
                onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                className="select w-full bg-slate-950/80 text-white border-2 border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                required
              >
                <option value="" disabled className="bg-slate-950 text-slate-400">Select learning language</option>
                {LANGUAGES.map((lang) => (
                  <option key={`learning-${lang}`} value={lang.toLowerCase()} className="bg-slate-950 text-white">
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
              className="input w-full bg-slate-950/80 text-white border-2 border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
              placeholder="City, Country"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full text-white bg-gradient-to-r from-primary to-secondary hover:brightness-110 border-0 h-12 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-base font-semibold transition-all hover:scale-[1.01] mt-4"
            disabled={isPending}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <Compass className="size-5" />
                Complete Onboarding
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
