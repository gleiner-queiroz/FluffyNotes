"use client"

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "reactfire";
import { useRouter } from "next/navigation";

export default function Add() {
    const [title, setTitle] = useState("");
    const [mood, setMood] = useState("");
    const [content, setContent] = useState("");
    const [moods, setMoods] = useState<any[]>([]);
    const { data: user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const fetchMoods = async () => {
            const firestore = getFirestore();
            const moodsRef = collection(firestore, "moods");
            const moodsSnap = await getDocs(moodsRef);
            setMoods(moodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchMoods();
    }, []);

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
            await addDoc(collection(firestore, "notes"), {
                title,
                content,
                moodId: mood,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
            setTitle("");
            setMood("");
            setContent("");
            toast({ title: "Sucesso!", description: "Sua nota foi inserida com sucesso!" });
            router.push("/");
        } catch (err) {
            toast({ title: "Erro ao salvar nota.", description: String(err), variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
            <form onSubmit={handleSubmit} className="bg-white/80 rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-center mb-2">Nova Nota</h2>
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
                    Enviar
                </button>
            </form>
        </div>
    );
}