"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon, CameraIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useMe } from "@/hooks/useMe";

import { createPortal } from "react-dom";

export default function ProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const me = useMe();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (me?.user) {
      setName(me.user.name);
      setImage(me.user.image || "");
    }
  }, [me]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("Image size must be less than 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Send image only if changed to avoid unnecessary payload? 
        // For simplicity, sending what is in state.
        body: JSON.stringify({ name, image }),
      });
      toast.success("Profile updated successfully!");
      
      // Reload page to reflect changes
      window.location.reload();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  // Hydration check for portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;



  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
          {/* Decorative Header Background */}
          <div className="h-32 bg-gradient-to-r from-violet-500 to-indigo-600"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors backdrop-blur-md z-10"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="px-6 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 bg-white shadow-lg overflow-hidden">
                   {image ? (
                      <img 
                        src={image} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                   ) : (
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400">
                          {name.charAt(0)?.toUpperCase()}
                      </div>
                   )}
                </div>
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-transform active:scale-95 border-2 border-white"
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Edit Profile</h3>
              <p className="text-slate-500 text-sm">Update your personal details</p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Image URL (Optional)
                </label>
                 <div className="relative">
                  <PhotoIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="url"
                    value={image.startsWith("data:") ? "" : image} // Don't show base64 strings
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="or paste an image link..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-slate-900"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 ml-1">
                  Upload a photo or paste a direct image link.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
