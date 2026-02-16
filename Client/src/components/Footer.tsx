const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <div className="relative h-16 w-full bg-linear-to-r from-orange-50 to-orange-100 flex items-center justify-center">
      {/* Centered copyright */}
      <p className="text-black text-sm">&copy; {year} Wham! Events. All rights reserved.</p>

      {/* Bottom-right corner text */}
      <span className="absolute right-4 bottom-1 text-xs text-orange-400" hidden>
        Developed by Akash.
      </span>
    </div>
  )
}

export default Footer
