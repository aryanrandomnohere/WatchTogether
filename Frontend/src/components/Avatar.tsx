
export default function Avatar({name}:{name:string}) {
  console.log(name);
  
  return (
    <div className="relative inline-flex items-center justify-center w-16 h-12 overflow-hidden bg-gray-100 rounded-xl dark:bg-gray-700">
    <span className="font-medium text-2xl text-gray-600 dark:text-gray-300">{name[0]}</span>
</div>
  )
}
