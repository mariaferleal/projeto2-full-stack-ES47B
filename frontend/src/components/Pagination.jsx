function Pagination({ info, currentPage, onPageChange }) {
  if (!info || info.pages <= 1) {
    return null
  }

  const firstPage = Math.max(1, currentPage - 2)
  const lastPage = Math.min(info.pages, currentPage + 2)
  const pages = []

  for (let page = firstPage; page <= lastPage; page += 1) {
    pages.push(page)
  }

  return (
    <nav className="pagination" aria-label="Paginacao">
      <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Anterior
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? 'active' : ''}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === info.pages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Proxima
      </button>
    </nav>
  )
}

export default Pagination
