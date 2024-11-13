
export default function Avatar({name,r}:{name:string,r:string}) {
  console.log(name);
  
  return (
    <div className={`relative inline-flex items-center justify-center ${r==="user"?"w-16 h-14": "w-10 h-10"} overflow-hidden rounded-xl ${r!=="user"?"bg-yellow-600":"bg-gray-700"}`}>
    <span className={`font-medium ${r!=="user"?"text-lg": "text-2xl"} text-gray-600 dark:text-gray-300`}>{name[0]?.toUpperCase()}{name[1]}</span>
</div>
  )
}
