"use client"

import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "reactfire";
import { signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const NavBar: FC = () => {
  const router = useRouter();
  const auth = useAuth();
  const { data: user } = useUser();
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      if (user && user.uid) {
        const firestore = getFirestore();
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          setNickname(userDoc.data().name || null);
        }
      }
    };
    fetchNickname();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="animate-in fade-in w-full">
      <nav className="flex w-full px-6 md:px-8 py-4 justify-between">
        <div className="flex items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="flex items-center text-3xl">
              Fluffy Notes | <span className="text-2xl ml-3">O Mundo das Notas Fofinhas!</span>
            </div>
          </Link>
        </div>
        <div className="px-6 md:px-8 py-4 flex items-center gap-4">
          <span className="font-bold mr-4 text-[#DC93BA] text-xl">
            {nickname || user.displayName || user.email || "Usuário"}
          </span>
          <button
            className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </nav>
    </div>
  );
};
