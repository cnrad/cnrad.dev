const MessageComponent = () => {
    return (
        <div className="row-span-3 bg-opacity-50 bg-slate-500/10 rounded-md p-4">
            <h1 className="font-bold text-sm text-slate-500 mb-1">EMAIL</h1>
            <input
                placeholder="example@gmail.com"
                type="text"
                className="w-full p-2 mb-4 rounded-md bg-slate-200/5 text-white text-sm placeholder:text-slate-200/20"
            />

            <h1 className="font-bold text-sm text-slate-500 mb-1">MESSAGE</h1>
            <textarea
                placeholder="Hi Conrad, what's up?"
                className="w-full p-2 h-36 mb-4 rounded-md bg-slate-200/5 text-white text-sm placeholder:text-slate-200/20"
            />
        </div>
    );
};

export default MessageComponent;
