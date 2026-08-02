import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, User as UserIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "صفحتي الشخصية — N.A.E Gifts Store" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch } = useProfile();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBirthday(profile.birthday || "");
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        setSaving(false);
        setMessage({ ok: false, text: "حدث خطأ أثناء رفع الصورة: " + uploadError.message });
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrlData.publicUrl;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: name.trim(), birthday: birthday || null, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (profileError) {
      setSaving(false);
      setMessage({ ok: false, text: "حدث خطأ أثناء حفظ البيانات: " + profileError.message });
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        setSaving(false);
        setMessage({ ok: false, text: "كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل." });
        return;
      }
      const { error: passError } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (passError) {
        setSaving(false);
        setMessage({ ok: false, text: "حدث خطأ أثناء تغيير كلمة السر: " + passError.message });
        return;
      }
    }

    await refetch();
    setNewPassword("");
    setAvatarFile(null);
    setSaving(false);
    setMessage({ ok: true, text: "تم حفظ التعديلات بنجاح ✅" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-md px-4 py-12 text-center text-muted-foreground">جارٍ التحميل...</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 text-center">
          <UserIcon className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-2xl font-extrabold">صفحتي الشخصية</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
              {avatarPreview || profile?.avatar_url ? (
                <img
                  src={avatarPreview || profile?.avatar_url || ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <UserIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm font-bold text-primary hover:underline">
              تغيير الصورة الشخصية
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">الاسم الكامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">رقم الواتساب</label>
            <input
              type="text"
              value={profile?.whatsapp || ""}
              disabled
              dir="ltr"
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">لا يمكن تغيير رقم الواتساب لأنه معرّف حسابك.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">تاريخ الميلاد</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              كلمة سر جديدة (اتركها فارغة إن لم ترغب بالتغيير)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {message && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                message.ok
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
