
const Loadings = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-orange-50 dark:bg-slate-900">
      <div
        className="animate-spin inline-block size-16 border-[3px] border-current border-t-transparent text-purple-500 rounded-full"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default Loadings;