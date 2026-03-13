const Loadings = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="animate-spin inline-block size-16 border-[3px] border-current border-t-transparent text-purple-500 rounded-full"
        role="status"
        aria-label="loading"
      >
      </div>

      {/* <img
        src="https://malpani.com/wp-content/uploads/2019/05/malpani-logo-2020.png"
        alt="Loading..."
        className="w-22 h-28"
      /> */}
      {/* <img
        src={Loading}
        alt="Loading..."
        className="w-48 h-48"
      /> */}
    </div>
  )
}

export default Loadings;