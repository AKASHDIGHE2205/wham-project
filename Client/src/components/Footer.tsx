const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className="relative h-16 w-full bg-linear-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
      <p className="text-gray-800 text-sm">&copy; {year} Wham! Events. All rights reserved.</p>
      <span className="absolute right-4 bottom-1 text-xs text-orange-400" hidden>
        build by Akash.
      </span>
    </div>
  )
}

export default Footer