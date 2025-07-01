import Image from "next/image";
import { MdStar } from "react-icons/md";

interface NoteProps {
    title: string;
    text: string;
    date: string;
    time: string;
    imageUrl: string;
    favorite?: boolean;
    onClick?: () => void;
}

export default function Note({ title, text, date, time, imageUrl, favorite, onClick }: NoteProps) {
    return (
        <div
            className="relative text-[#655167] w-96 h-48 flex flex-col items-start justify-start p-4 bg-[#F5D1E880] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={onClick}
        >
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-sm h-16 line-clamp-3">{text}</p>
            <p className="absolute -top-2 -right-4 text-lg font-bold" style={{ transform: 'rotate(15deg)' }}>{date}</p>
            <p className="absolute top-3 -right-2" style={{ transform: 'rotate(15deg)' }}>{time}</p>
            <Image className="absolute -bottom-2 -right-4 w-16 h-16 rounded-full mt-4" style={{ transform: 'rotate(15deg)' }} src={imageUrl} alt="" width={64} height={64} />
            {favorite && (
                <span className="absolute bottom-2 left-2 text-yellow-400">
                    <MdStar size={28} />
                </span>
            )}
        </div>
    )
}