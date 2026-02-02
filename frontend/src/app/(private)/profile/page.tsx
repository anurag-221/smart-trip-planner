"use client";

import { useState, useEffect, useRef } from "react";
import { CameraIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useMe } from "@/hooks/useMe";
import PageContainer from "@/components/layout/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const me = useMe();
  const { logout } = useAuth();
  const router = useRouter();
  
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
        body: JSON.stringify({ name, image }),
      });
      toast.success("Profile updated successfully!");
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
      await logout();
      router.push("/");
  }

  return (
    <PageContainer>
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-slate-400">Manage your personal information</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="relative -mt-16 mb-6 flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 bg-slate-800 shadow-lg overflow-hidden border-4 border-slate-900">
                   {image ? (
                      <img 
                        src={image} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                   ) : (
                      <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold text-slate-400">
                          {name.charAt(0)?.toUpperCase()}
                      </div>
                   )}
                </div>
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-emerald-600 rounded-full text-white shadow-lg hover:bg-emerald-700 transition-transform active:scale-95 border-2 border-slate-900"
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

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-slate-800 transition-all font-medium text-white placeholder-slate-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Image URL (Optional)
                </label>
                 <div className="relative">
                  <PhotoIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="url"
                    value={image.startsWith("data:") ? "" : image} 
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="or paste an image link..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-slate-800 transition-all text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                    Log Out
                </button>
              </div>
            </form>
        </div>
      </div>
    </PageContainer>
  );
}
