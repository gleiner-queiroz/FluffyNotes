"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getFirestore, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useUser } from "reactfire";
import { MdEdit, MdDelete, MdStar, MdStarBorder, MdArrowForward, MdArrowBack } from "react-icons/md";

export default function ViewNote() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const { data: user, hasEmitted } = useUser();
    const router = useRouter();
    const [note, setNote] = useState<any>(null);
    const [mood, setMood] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (hasEmitted && !user) {
            router.replace("/login");
            return;
        }
        if (user && id) {
            const fetchNote = async () => {
                const firestore = getFirestore();
                const noteRef = doc(firestore, "notes", id as string);
                const noteSnap = await getDoc(noteRef);
                if (noteSnap.exists()) {
                    const noteData = noteSnap.data();
                    setNote(noteData);
                    setIsFavorite(!!noteData.favorite);
                    if (noteData.moodId) {
                        const moodRef = doc(firestore, "moods", noteData.moodId);
                        const moodSnap = await getDoc(moodRef);
                        if (moodSnap.exists()) {
                            setMood(moodSnap.data());
                        }
                    }
                } else {
                    setNote(null);
                }
            };
            fetchNote();
        }
    }, [user, hasEmitted, id, router]);

    const handleDelete = async () => {
        if (!user || !id) return;
        const confirmed = window.confirm("Tem certeza que deseja excluir esta nota?");
        if (!confirmed) return;
        try {
            const firestore = getFirestore();
            await deleteDoc(doc(firestore, "notes", id));
            router.push("/");
        } catch (err) {
            alert("Erro ao excluir nota: " + err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user || !id) return;
        try {
            const firestore = getFirestore();
            const noteRef = doc(firestore, "notes", id);
            await updateDoc(noteRef, { favorite: !isFavorite });
            setIsFavorite(!isFavorite);
        } catch (err) {
            alert("Erro ao atualizar favorito: " + err);
        }
    };

    if (!user) return <div>Carregando...</div>;
    if (!note) return <div>Nota não encontrada.</div>;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen mt-40 px-4 py-8">
            <div className="bg-white/80 rounded-lg shadow-md p-8 w-full max-w-lg flex flex-col gap-6 relative">
                <button
                    className="absolute top-4 left-4 text-yellow-400 hover:text-yellow-500 text-2xl"
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                    {isFavorite ? <MdStar size={32} /> : <MdStarBorder size={32} />}
                </button>
                <button
                    className="absolute top-4 right-16 text-pink-400 hover:text-pink-600 text-2xl"
                    onClick={() => router.push(`/edit/${id}`)}
                    aria-label="Editar nota"
                >
                    <MdEdit size={32} />
                </button>
                <button
                    className="absolute top-4 right-4 text-pink-400 hover:text-pink-600 text-2xl"
                    onClick={() => router.push("/")}
                    aria-label="Voltar"
                >
                    <MdArrowBack size={32} className="rotate-180" />
                </button>
                <button
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-500 hover:text-red-700 text-2xl z-10 bg-white/90 rounded-full p-2 shadow"
                    onClick={handleDelete}
                    aria-label="Excluir nota"
                >
                    <MdDelete size={32} />
                </button>
                <h2 className="text-3xl font-bold text-center mt-8 mb-2">{note.title}</h2>
                <div className="flex items-center gap-4 mb-4">
                    {mood && (
                        <div className="flex items-center gap-2">
                            <Image src={mood.imageURL} alt={mood.name} width={48} height={48} className="rounded-full" />
                            <span className="font-semibold" style={{ color: mood.color }}>{mood.name}</span>
                        </div>
                    )}
                    <span className="text-gray-500 ml-auto">
                        {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString() : ""}
                        {" "}
                        {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleTimeString() : ""}
                    </span>
                </div>
                <div className="whitespace-pre-line text-lg">{note.content}</div>
            </div>
        </div>
    );
}
