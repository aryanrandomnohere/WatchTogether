import { useEffect, useState } from "react";
import Series from "../components/Series";
import { useParams } from "react-router-dom";
import Button from "../ui/Button";
import { HiOutlineAcademicCap, HiOutlinePencil } from "react-icons/hi2";


export default function Room() {
    const { id: paramId } = useParams<{ id?: string }>(); // Destructure id from useParams and add typing
    const [id, setId] = useState<string>(paramId || ""); // Initialize with paramId or an empty string
const [isOpen, setIsOpen]= useState<boolean>(false);
    useEffect(() => {
        if (paramId) {
            setId(paramId); // Only set if paramId is defined
        }
    }, [paramId]);

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center p-4 sm:items-start">
           <div className="flex gap-1">
            <Button w="3" onClick={()=>setIsOpen(!isOpen)}>{ isOpen ? <HiOutlinePencil/> : <HiOutlineAcademicCap/>} </Button>
            {isOpen && <div className="flex w-full sm:w-1/2 lg:w-1/3">
                <input
                    className=" text-xs  rounded-lg mt-4 py-1 px-3 font-medium bg-white bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none sm:w-96"
                    placeholder="Enter IMDb ID or a download link to stream"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                
            </div>}
            </div>

            <div className="w-full grid grid-cols-4 grid-rows-1 sm:grid-cols-3 gap-4 mt-0">
                <div className="flex justify-center items-center col-span-4 row-span-2 sm:col-span-2 bg-black bg-opacity-25  rounded-lg p-4 ">
                    <Series imdbId={id} />
                </div>
            </div>
        </div>
    );
}
