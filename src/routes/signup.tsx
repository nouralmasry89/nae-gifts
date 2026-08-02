import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { supabase, whatsappToEmail, normalizeWhatsapp } from "@/lib/supabase";
import { enablePushNotifications } from "@/lib/push-client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب — N.A.E Gifts Store" },
      { name: "description", content: "أنشئ حسابك للحصول على عروض وحسومات خاصة." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanWhatsapp = normalizeWhatsapp(whatsapp);
    if (!name.trim() || cleanWhatsapp.length < 8 || password.length
