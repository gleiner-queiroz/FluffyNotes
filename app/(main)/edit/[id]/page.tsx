"use client";

import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "reactfire";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function EditNote() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const { data: user, hasEmitted } = useUser();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [mood, setMood] = useState("");
    const [content, setContent] = useState("");
    const [moods, setMoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hasEmitted && !user) {
            router.replace("/login");
            return;
        }
        const fetchData = async () => {
            const firestore = getFirestore();
            // Busca moods
            const moodsRef = collection(firestore, "moods");
            const moodsSnap = await getDocs(moodsRef);
            setMoods(moodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            // Busca nota
            if (user && id) {
                const noteRef = doc(firestore, "notes", id);
                const noteSnap = await getDoc(noteRef);
                if (noteSnap.exists()) {
                    const noteData = noteSnap.data();
                    setTitle(noteData.title || "");
                    setMood(noteData.moodId || "");
                    setContent(noteData.content || "");
                } else {
                    toast({ title: "Nota não encontrada.", variant: "destructive" });
                    router.push("/");
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [user, hasEmitted, id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: "Usuário não autenticado.", variant: "destructive" });
            return;
        }
        if (!title.trim()) {
            toast({ title: "O título é obrigatório.", variant: "destructive" });
            return;
        }
        if (!mood) {
            toast({ title: "Selecione um mood.", variant: "destructive" });
            return;
        }
        if (!content.trim()) {
            toast({ title: "O conteúdo é obrigatório.", variant: "destructive" });
            return;
        }
        try {
            const firestore = getFirestore();
            const noteRef = doc(firestore, "notes", id!);
            await updateDoc(noteRef, {
                title,
                content,
                moodId: mood,
            });
            toast({ title: "Nota atualizada com sucesso!" });
            router.push(`/view/${id}`);
        } catch (err) {
            toast({ title: "Erro ao atualizar nota.", description: String(err), variant: "destructive" });
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
            <form onSubmit={handleSubmit} className="bg-white/80 rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-center mb-2">Editar Nota</h2>
                <div>
                    <label className="block mb-1 font-medium">Título</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mood</label>
                    <div className="flex gap-4 mt-2">
                        {moods.map((m) => (
                            <button
                                type="button"
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`rounded-full border-4 transition-all ${mood === m.id ? 'border-pink-400' : 'border-transparent'} focus:outline-none`}
                                style={{ backgroundColor: m.color }}
                                aria-label={m.name}
                            >
                                <Image src={m.imageURL} alt={m.name} width={48} height={48} className="rounded-full" />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Conteúdo</label>
                    <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-pink-300"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded transition-colors mt-2"
                >
                    Salvar alterações
                </button>
                <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded transition-colors mt-2"
                    onClick={() => router.push(`/view/${id}`)}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
}
