"use client"
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "./ui/card";
import { toast } from "react-toastify";
import type { RootState, AppDispatch } from "@/lib/store";
import { setPasswords } from "@/lib/features/passwordSlice";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  );

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = ({ item, deletePassword }: any) => (
  <lord-icon
    src="https://cdn.lordicon.com/tftntjtg.json"
    trigger="hover"
    stroke="bold"
    onClick={() => deletePassword(item._id)}
    style={{ width: "22px", height: "22px", cursor: "pointer" }}
  />
);

const EditIcon = ({ item, editPassword }: any) => (
  <lord-icon
    src="https://cdn.lordicon.com/iubtdgvu.json"
    trigger="hover"
    stroke="bold"
    onClick={() => editPassword(item._id, item.username, item.password, item.site)}
    style={{ width: "22px", height: "22px", cursor: "pointer" }}
  />
);

const PasswordManager = () => {
  const { getToken, userId } = useAuth();
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const passwords = useSelector((state: RootState) => state.password.passwords);
  const dispatch = useDispatch<AppDispatch>();
  const toastObj = useSelector((state: any) => state.toast.toastObj);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const [editId, setEditId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied Successfully", toastObj);
  };

  const toggleVisible = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  async function editPassword(id: string, user: string, pass: string, url: string) {
    const c = confirm("Do you really want to edit these details?");

    if (c) {
      setEditMode(true);
      setUsername(user);
      setPassword(pass);
      setWebsite(url);
      setEditId(id);
      const updated = passwords.filter((item: any) => item._id !== id);
      dispatch(setPasswords(updated));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function deletePassword(id: string) {
    let token = await getToken();
    const c = confirm("Do you really want to delete this password?");
    if (c) {
      await fetch("http://localhost:8080/passwords", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ _id: id, userId }),
      });
      getPasswords();
      toast.success("Password deleted successfully !!!!", toastObj)
    }
  }

  async function getPasswords() {
    try {
      const token = await getToken();
      if (!token) return; // ← add this guard

      const req = await fetch("http://localhost:8080/passwords", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!req.ok) {
        const errBody = await req.text(); // ← log the actual server message
        console.error("Server responded with:", req.status, errBody);
        throw new Error(`Server error ${req.status}`);
      }

      const data = await req.json();
      dispatch(setPasswords(data));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  useEffect(() => {
    if (userId) {
      getPasswords();
    }
  }, [userId]);

  async function savePassword() {
    const token = await getToken();
    
    if (!website.trim() || !username.trim() || !password.trim()) {
      toast.error("Please fill all the details", toastObj);
      return;
    }

    if (editMode) {
      await fetch("http://localhost:8080/passwords", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ _id: editId, site: website, username, password }),
      });
      setEditMode(false);
      toast.success("Password edited successfully!!", toastObj);
    } else {
      await fetch("http://localhost:8080/passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ site: website, username, password, userId: userId })
      })
      toast.success("Password saved successfully!!", toastObj);
    }

    setPassword("");
    setUsername("");
    setWebsite("");
    getPasswords();
  }

  return (
    <div className="flex flex-col items-center w-full px-3 sm:px-6 py-6">
      {/* Form card — original styling, fully responsive width */}
      <div className={`w-full max-w-xs sm:max-w-md md:max-w-2xl flex rounded-2xl flex-col
        ${darkMode ? "shadow-[#29bf1f]" : "shadow-black"} z-10 mt-4 shadow-2xl p-5 sm:p-8`}>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl w-text md:text-4xl font-bold text-center mb-4 top-0">
          {editMode ? "Edit your Details" : "Add a password"}
        </h1>

        <Card className="w-full px-8">
          <div className="flex flex-col space-y-3 mt-4">
            <div>
              <p className="sm:text-base mb-1 w-text">Website</p>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                type="text"
                placeholder="https://example.com"
                className="w-full w-text text-white p-3 rounded-lg bg-slate-800 border px-3 py-2.5 text-sm sm:text-base"
              />
            </div>

            <div>
              <p className="sm:text-base mb-1 w-text">Username</p>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="your@email.com"
                className="w-full w-text text-white p-3 rounded-lg bg-slate-800 border px-3 py-2.5 text-sm sm:text-base"
              />
            </div>

            <div>
              <p className="text-sm sm:text-base mb-1 w-text">Password</p>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="text"
                placeholder="Enter password"
                className="w-full w-text text-white p-3 rounded-lg bg-slate-800 border px-3 py-2.5 text-sm sm:text-base"
              />
            </div>

            <button
              onClick={savePassword}
              className="mt-4 w-text bg-linear-to-br cursor-pointer rounded-full from-pink-500 to-orange-400 px-4 py-2.5 text-sm sm:text-base font-medium"
            >
              {editMode ? "Update Password" : "Save these details"}
            </button>

            {editMode && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setWebsite("");
                  setUsername("");
                  setPassword("");
                  setEditId(null);
                  getPasswords();
                }}
                className={`rounded-full w-text px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors
                ${darkMode ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
              >
                Cancel
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Section heading */}
      <p className="text-xl sm:text-2xl my-6 text-center w-text">Your own passwords</p>

      {/* Password list */}
      <div className={`w-full max-w-xs sm:max-w-md md:max-w-2xl rounded-2xl shadow-2xl p-4 sm:p-6 transition-colors duration-300
        ${darkMode ? "shadow-[#29bf1f]" : "bg-zinc-50 shadow-black"}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base
              ${darkMode ? "bg-zinc-800 text-green-400" : "bg-green-50 text-green-600"}`}>
              🔑
            </div>
            <h3 className={`text-base w-text sm:text-xl font-bold ${darkMode ? "text-white" : "text-zinc-800"}`}>
              Your Passwords
            </h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
            ${darkMode ? "bg-zinc-700 text-green-400 ring-1 ring-zinc-600" : "bg-green-100 text-green-700"}`}>
            {passwords.length} saved
          </span>
        </div>

        {/* Empty state */}
        {passwords.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 sm:py-20 rounded-2xl border-2 border-dashed
            ${darkMode ? "border-zinc-700 text-zinc-500" : "border-zinc-200 text-zinc-400"}`}>
            <p className="text-5xl sm:text-6xl mb-4">🔒</p>
            <p className={`text-base sm:text-lg font-semibold ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
              No passwords saved yet.
            </p>
            <p className={`text-xs sm:text-sm mt-1 text-center px-4 ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
              Add your first password to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {passwords.map((item: any, index: number) => (
              <div
                key={item._id || index}
                className={`group flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 transition-all duration-300
                  ${darkMode
                    ? "bg-zinc-800/80 border-zinc-700 hover:border-green-500 hover:bg-zinc-800 hover:shadow-xl hover:shadow-green-950/40"
                    : "bg-white border-zinc-100 hover:border-green-400 shadow-sm hover:shadow-xl hover:shadow-green-100/70"
                  }`}
              >
                {/* Avatar — hidden on very small screens */}
                <div className={`hidden xs:flex w-10 h-10 sm:w-12 sm:h-12 rounded-2xl items-center justify-center font-bold text-base sm:text-lg shrink-0 transition-transform duration-200 group-hover:scale-105
                  ${darkMode
                    ? "bg-linear-to-br from-green-500/20 to-emerald-700/20 text-green-400 ring-1 ring-green-700/60"
                    : "bg-linear-to-br from-green-100 to-emerald-100 text-green-700 ring-1 ring-green-200"
                  }`}>
                  {item.username[0].toUpperCase()}
                </div>

                {/* Site + Username */}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-white" : "text-zinc-800"}`}>
                    {item.site}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                    {item.username}
                  </p>
                </div>

                {/* Password pill — hidden on mobile, shown on sm+ */}
                <div className={`hidden sm:block px-3 py-2 rounded-xl shrink-0
                  ${darkMode ? "bg-zinc-900/70 ring-1 ring-zinc-700" : "bg-zinc-50 ring-1 ring-zinc-200"}`}>
                  <span className={`text-xs font-mono tracking-widest select-none
                    ${darkMode ? "text-zinc-200" : "text-zinc-600"}`}>
                    {visible[item._id] ? item.password : "••••••••••"}
                  </span>
                </div>

                {/* Divider — hidden on mobile */}
                <div className={`hidden sm:block w-px h-8 shrink-0 ${darkMode ? "bg-zinc-700" : "bg-zinc-200"}`} />

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => toggleVisible(item._id)}
                    title={visible[item._id] ? "Hide" : "Show"}
                    className={`p-1.5 sm:p-2 cursor-pointer rounded-xl transition-all duration-150
                      ${darkMode ? "text-zinc-400 hover:text-green-400 hover:bg-zinc-700" : "text-zinc-400 hover:text-green-600 hover:bg-green-50"}`}>
                    <EyeIcon open={!!visible[item._id]} />
                  </button>

                  <button
                    onClick={() => handleCopy(item.password, item._id)}
                    title="Copy"
                    className={`p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all duration-150
                      ${copied === item._id
                        ? darkMode ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-50"
                        : darkMode ? "text-zinc-400 hover:text-green-400 hover:bg-zinc-700" : "text-zinc-400 hover:text-green-600 hover:bg-green-50"
                      }`}>
                    {copied === item._id ? <CheckIcon /> : <CopyIcon />}
                  </button>

                  <button
                    title="Edit Password"
                    className={`p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all duration-150
                      ${darkMode ? "text-zinc-400 hover:text-blue-400 hover:bg-zinc-700" : "text-zinc-400 hover:text-blue-600 hover:bg-blue-50"}`}>
                    <EditIcon item={item} editPassword={editPassword} />
                  </button>

                  <button
                    title="Delete Password"
                    className={`p-1.5 sm:p-2 cursor-pointer rounded-xl transition-all duration-150
                      ${darkMode ? "text-zinc-500 hover:text-red-400 hover:bg-red-900/20" : "text-zinc-300 hover:text-red-500 hover:bg-red-50"}`}>
                    <TrashIcon item={item} deletePassword={deletePassword} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordManager;