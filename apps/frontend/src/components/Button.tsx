
export const Button=({onClick}:{onClick:()=>void})=>{
    return (
        <button
            onClick={onClick}
            className="px-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-white font-bold rounded"
            >
            Start 
        </button>
    )
}

