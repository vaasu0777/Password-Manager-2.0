const Footer = () => {
    return (
        <footer className="bg-black flex flex-col bottom-0 max-w-full min-w-full justify-center items-center py-4 px-4">
            <div className="logo flex items-center justify-center">
                <span className="text-green-500 w-text text-4xl">&lt;</span>
                <p className="w-text text-4xl text-white">Pass</p>
                <span className="text-green-500 w-text text-4xl">OP/&gt;</span>
            </div>
            <div className="flex flex-wrap justify-center items-center text-white gap-1 mt-1">
                <p className="footer-text text-md xl:text-2xl">Created with</p>
                <img src="./Heart.svg" alt="Heart" width={30} className="v translate-y-2"/>
                <p className="footer-text text-md xl:text-2xl">by Vaasu Gagneja</p>
            </div>
        </footer>
    )
}

export default Footer