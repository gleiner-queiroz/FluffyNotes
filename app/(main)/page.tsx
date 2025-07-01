"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "reactfire";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { MdAdd } from "react-icons/md";
import Note from "@/components/note";

export default function Home() {
  const { data: user, hasEmitted } = useUser();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (hasEmitted && !user) {
      router.replace("/login");
    }
    if (user) {
      const fetchUserData = async () => {
        const firestore = getFirestore();
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      };
      fetchUserData();

      const fetchNotes = async () => {
        const firestore = getFirestore();
        const notesRef = collection(firestore, "notes");
        const q = query(notesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const notesList = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const noteData = docSnap.data();
            let moodData = null;
            if (noteData.moodId) {
              const moodRef = doc(firestore, "moods", noteData.moodId);
              const moodSnap = await getDoc(moodRef);
              if (moodSnap.exists()) {
                moodData = moodSnap.data();
              }
            }
            return {
              id: docSnap.id,
              ...noteData,
              mood: moodData,
            };
          })
        );
        setNotes(notesList);
      };
      fetchNotes();
    }
  }, [user, hasEmitted, router]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen px-6 md:px-8 py-4">
      <h1 className="text-2xl font-bold">
        Bem-vindo, {userData?.name ?? ""}!
      </h1>

      <div className="w-full mt-8 flex gap-10 flex-wrap justify-center">
        {notes.map((note) => (
          <Note
            key={note.id}
            title={note.title}
            text={note.content}
            date={note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString() : ""}
            time={note.createdAt?.toDate ? note.createdAt.toDate().toLocaleTimeString() : ""}
            imageUrl={note.mood?.imageURL || "/default.png"}
            favorite={!!note.favorite}
            onClick={() => router.push(`/view/${note.id}`)}
          />
        ))}
      </div>

      <button
        className="fixed bottom-8 left-8 w-16 h-16 rounded-full bg-pink-400 text-white text-4xl flex items-center justify-center shadow-lg hover:bg-pink-500 transition-colors"
        aria-label="Adicionar"
        onClick={() => router.push("/add")}
      >
        <MdAdd size={36} />
      </button>
    </div>
  );
}
