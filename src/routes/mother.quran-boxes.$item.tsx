import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getQuranItem } from "@/lib/quranBoxes";
import { waLink } from "@/lib/categories";

export const Route = createFileRoute("/mother/quran-boxes/$item")({
  loader: ({ params }) => {
    const item = getQuranItem(params.item);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.item.name} — مصاحف وصناديق مصاحف — N.A.E` },
          { name: "description", content: loaderData.item.description },
          { property: "og:title", content: `${loaderData.item.name} — N.A.E` },
          { property: "og:description", content: loaderData.item.description },
          { property: "og:image", content: loaderData.item.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">القسم غير موجود</h1>
        <Link to="/mother/$sub" params={{ sub: "quran-boxes" }} className="mt-4 inline-block text-primary hover:underline">
          العودة لمصاحف وصناديق مصاحف
        </Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">حدث خطأ ما</h1>
    </div>
  ),
  component: QuranItemPage,
});

function QuranItemPage() {
  const { item } = Route.useLoaderData();
  const [showForm, setShowForm] = useState(false);
  const [nameOnMushaf, setNameOnMushaf] = useState("");
  const [phrase, setPhrase] = useState("");
  const [color, setColor] = useState("");

  const buildMessage = () => {
    const lines = [
      `طلب جديد: ${item.name}`,
      `— الإسم على المصحف: ${nameOnMushaf || "-"}`,
      `— العبارة: ${phrase || "-"}`,
      `— اللون: ${color || "-"}`,
    ];
    if (item.price) lines.push(`— السعر: ${item.price}`);
    lines.push(`\nرابط المنتج: ${typeof window !== "undefined" ? window.location.href : ""}`);
    return lines.join("\n");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/mother/$sub" params={{ sub: "quran-boxes" }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4 rotate-180" /> مصاحف وصناديق مصاحف
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">{item.name}</h1>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            {item.price && (
              <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-lg font-extrabold text-primary">
                {item.price}
              </div>
            )}

            {item.hasOrderForm ? (
              !showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
                >
                  <MessageCircle className="h-5 w-5" /> اطلبه الآن
                </button>
              ) : (
                <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">الإسم على المصحف</label>
                    <input
                      value={nameOnMushaf}
                      onChange={(e) => setNameOnMushaf(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="الإسم كما ترغبون بكتابته"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">العبارة</label>
                    <textarea
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="آية أو دعاء أو عبارة من اختياركم"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">اللون</label>
                    <input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="مثال: خمري، أخضر، زهري…"
                    />
                  </div>
                  <a
                    href={waLink(buildMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <MessageCircle className="h-5 w-5" /> اطلبه الآن عبر واتساب
                  </a>
                </div>
              )
            ) : (
              <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                سنقوم قريباً بإضافة موديلات صناديق المصاحف المتوفرة داخل هذا القسم. للاستفسار أو طلب تصميم خاص، تواصلوا معنا مباشرة عبر واتساب.
                <a
                  href={waLink(`مرحباً، أود الاستفسار عن ${item.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> تواصل عبر واتساب
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
