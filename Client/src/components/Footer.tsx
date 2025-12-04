const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <div className="h-16 w-full flex justify-center items-center bg-linear-to-r from-orange-50 to-orange-100">
      <p className="text-sm text-gray-900">
        &copy; {year} Wham! Events. All rights reserved.
      </p>
    </div>
  )
}

export default Footer
